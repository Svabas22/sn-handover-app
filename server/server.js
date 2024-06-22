require('dotenv').config();
if (process.env.ENVR === 'dev') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const redis = require('redis');
const RedisStore = require('connect-redis').default;
const { CosmosClient } = require("@azure/cosmos");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const handoverTemplate = require('./template-page.json');
const isAuthenticated = require('./auth/isAuthenticated');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const redisClient = redis.createClient({
  url: process.env.REDIS_KEY,
  tls: {
    rejectUnauthorized: process.env.ENVR === 'production'
  }
});
redisClient.connect().catch(console.error);

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.ENVR === 'production',
  }
}));

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = "handoversys";
const containerId = "snRecords";
const shiftsContainerId = "snShifts";
const client = new CosmosClient({ endpoint, key });
let container;

async function initializeCosmosDB() {
  try {
    const database = (await client.databases.createIfNotExists({ id: databaseId })).database;
    container = (await database.containers.createIfNotExists({ id: containerId })).container;
    shiftsContainer = (await database.containers.createIfNotExists({ id: shiftsContainerId })).container;
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
  }
}

initializeCosmosDB();

app.set('trust proxy', 1);

app.post('/api/real-time-updates', (req, res) => {
  const changes = req.body;
  console.log('Received real-time updates:', changes); // Add logging
  changes.forEach(change => {
    io.emit('pageUpdated', change);
  });
  res.status(200).send('Changes broadcasted.');
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('editPage', (data) => {
    io.emit('pageUpdated', data);
  });

  socket.on('deletePage', (data) => {
    io.emit('pageDeleted', data);
  });
});

app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q;
  if (!container) {
    return res.status(500).json({ error: 'Cosmos DB container is not initialized' });
  }
  try {
    // This query assumes `incNumber` can be in any client and any incident.
    const querySpec = {
      query: `SELECT c.id, c.title, c.clients
              FROM c
              JOIN client IN c.clients
              JOIN incident IN client.incidents
              WHERE incident.incNumber = @searchQuery`,
      parameters: [{ name: "@searchQuery", value: searchQuery }]
    };

    const { resources: items } = await container.items.query(querySpec).fetchAll();
    if (items.length > 0) {
      console.log("Search results:", items);  // Log to verify results
      res.status(200).json(items);
    } else {
      res.status(404).json({ message: 'No results found' });
    }
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/records', async (req, res) => {
  const { id, title, date, engineersOnShift, clients, pageId } = req.body;
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const newRecord = { id, title, date, engineersOnShift, clients, pageId };
    const { resource: createdItem } = await container.items.create(newRecord);
    res.status(201).json(createdItem);
    io.emit('pageCreated', createdItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT c.id, c.title FROM c ORDER BY c.date DESC"
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/copy-handover', async (req, res) => {
  try {
    const querySpec = {
      query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 1"
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    if (items.length > 0) {
      const latestDocument = items[0];
      let newDocument = { ...latestDocument };
      delete newDocument.id;

      Object.keys(newDocument.clients).forEach(client => {
        newDocument.clients[client].incidents = newDocument.clients[client].incidents.filter(incident => incident.status !== 'Resolved');
        newDocument.clients[client].problems = newDocument.clients[client].problems.filter(problem => problem.status !== 'Resolved');
        newDocument.clients[client].changes = newDocument.clients[client].changes.filter(change => change.status !== 'Closed');
      });

      let today = new Date();
      newDocument.date = today.toISOString().split('T')[0];
      newDocument.title = `Handover ${newDocument.date} - ${today.getHours() >= 3 && today.getHours() < 15 ? 'Day' : 'Night'}`;

      const { resource: createdItem } = await container.items.create(newDocument);
      res.status(200).json(createdItem);
      io.emit('pageCreated', createdItem);
    } else {
      res.status(404).send('No existing documents found to clone.');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/copy-template', async (req, res) => {
  try {
    const querySpec = {
      query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 1"
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    if (items.length > 0) {
      let newDocument = { ...handoverTemplate };
      delete newDocument.id;

      let today = new Date();
      newDocument.date = today.toISOString().split('T')[0];
      newDocument.title = `Handover ${newDocument.date} - ${today.getHours() >= 3 && today.getHours() < 15 ? 'Day' : 'Night'}`;

      const { resource: createdItem } = await container.items.create(newDocument);
      res.status(200).json(createdItem);
      io.emit('pageCreated', createdItem);
    } else {
      res.status(404).send('No existing documents found to clone.');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records/:id', async (req, res) => {
  const pageId = req.params.id;
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @pageId",
      parameters: [
        { name: "@pageId", value: pageId }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(items[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/records/:id', async (req, res) => {
  const pageId = req.params.id;
  const updatedDocument = req.body;

  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const partitionKey = updatedDocument.pageId;
    const { resource: doc } = await container.item(pageId, partitionKey).replace(updatedDocument);
    res.status(200).json(doc);
    io.emit('pageUpdated', doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  const pageId = req.params.id;
  const partitionKey = req.body.pageId;
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const { resource: result } = await container.item(pageId, partitionKey).delete();
    if (result) {
      res.status(204).send();
      io.emit('pageDeleted', { id: pageId });
    }
  } catch (error) {
    res.status(500).json({ error: "An internal error occurred while deleting the record." });
  }
});


// Shift management
app.get('/api/shifts', async (req, res) => {
  try {
    if (!shiftsContainer) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT * FROM c ORDER BY c._ts DESC"
    };
    const { resources: items } = await shiftsContainer.items.query(querySpec).fetchAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/shifts/:id', async (req, res) => {
  const shiftId = req.params.id;
  try {
    if (!shiftsContainer) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @shiftId",
      parameters: [
        { name: "@shiftId", value: shiftId }
      ]
    };
    const { resources: items } = await shiftsContainer.items.query(querySpec).fetchAll();
    res.status(200).json(items[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shifts', async (req, res) => {
  const { id, date, engineersOnShift } = req.body;
  try {
    if (!shiftsContainer) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const newShift = { id, date, engineersOnShift };
    const { resource: createdItem } = await shiftsContainer.items.create(newShift);
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/shifts/:id', async (req, res) => {
  const shiftId = req.params.id;
  const updatedShift = req.body;
  try {
    if (!shiftsContainer) {
      throw new Error('Shifts container is not initialized');
    }
    const partitionKey = updatedShift.id;
    const { resource: doc } = await shiftsContainer.item(shiftId, partitionKey).replace(updatedShift);
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/latest-page', async (req, res) => {
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 1"
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    if (items.length > 0) {
      res.status(200).json(items[0]);
    } else {
      res.status(404).send('No pages found.');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
