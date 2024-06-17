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
const client = new CosmosClient({ endpoint, key });
let container;

async function initializeCosmosDB() {
  try {
    const database = (await client.databases.createIfNotExists({ id: databaseId })).database;
    container = (await database.containers.createIfNotExists({ id: containerId })).container;
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
    const querySpec = {
      query: "SELECT c.id, c.title, c.date, c.engineersOnShift, c.clients FROM c WHERE CONTAINS(c.title, @searchQuery) OR CONTAINS(c.clients, @searchQuery)",
      parameters: [
        { name: "@searchQuery", value: searchQuery }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(items);
  } catch (error) {
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

      let today = new Date();
      newDocument.date = today.toISOString().split('T')[0];
      newDocument.title = `Handover ${newDocument.date} - ${today.getHours() >= 3 && today.getHours() < 15 ? 'Day' : 'Night'}`;

      const { resource: createdItem } = await container.items.create(newDocument);
      res.status(201).send(`New document created with id: ${createdItem.id}`);
      io.emit('pageCreated', createdItem);
    } else {
      res.status(404).send('No existing documents found to clone.');
    }
  } catch (error) {
    res.status(500).send(`An error occurred: ${error.message}`);
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
      res.status(201).send(`New document created with id: ${createdItem.id}`);
      io.emit('pageCreated', createdItem);
    } else {
      res.status(404).send('No existing documents found to clone.');
    }
  } catch (error) {
    res.status(500).send(`An error occurred: ${error.message}`);
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



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
