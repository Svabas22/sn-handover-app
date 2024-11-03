require('dotenv').config();
if (process.env.ENVR === 'dev') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const http = require('http');
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
let usersOnPage = {};
const RedisStore = require('connect-redis').default;
const { CosmosClient } = require("@azure/cosmos");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const handoverTemplate = require('./template-page.json');
const isAuthenticated = require('./auth/isAuthenticated');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://sn-handover-app.azurewebsites.net'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'], // Ensure WebSocket is prioritized
  allowEIO3: true,  // Allow Engine.IO version 3 for compatibility
  debug: true      // Enable debug mode for more logging
});

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

// Redis client for subscribing to channels
const redisSubscriber = redisClient.duplicate();

async function initRedisSubscriber() {
  await redisSubscriber.connect();

  redisSubscriber.subscribe('page_updates', (message, channel) => {
    console.log(`Received message from Redis on channel ${channel}: ${message}`);
    io.emit('pageUpdated', JSON.parse(message));
  });
}

initRedisSubscriber().catch(console.error);

app.use(cors({
  origin: ['http://localhost:3000', 'https://sn-handover-app.azurewebsites.net'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

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
const clientsContainerId = "snClients";
const client = new CosmosClient({ endpoint, key });
let container;

async function initializeCosmosDB() {
  try {
    const database = (await client.databases.createIfNotExists({ id: databaseId })).database;
    container = (await database.containers.createIfNotExists({ id: containerId })).container;
    shiftsContainer = (await database.containers.createIfNotExists({ id: shiftsContainerId })).container;
    clientsContainer = (await database.containers.createIfNotExists({ id: clientsContainerId })).container;
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
  }
}

initializeCosmosDB();

app.set('trust proxy', 1);
let usersOnPages = {};


io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('viewPage', ({ pageId, userName }) => {
    const socketId = socket.id;
    
    Object.keys(usersOnPages).forEach((page) => {
      usersOnPages[page] = usersOnPages[page].filter(user => user.socketId !== socketId);
    });

    if (!usersOnPages[pageId]) {
      usersOnPages[pageId] = [];
    }

    usersOnPages[pageId].push({ socketId, userName, pageId });
    //socket.join(pageId);
    console.log('Users on page after viewPage:', usersOnPages[pageId]);
    io.to(pageId).emit('usersOnPage', usersOnPages[pageId]);
    
  });
  socket.on('leavePage', ({ pageId }) => {
    // Remove the user from the page
    if (usersOnPages[pageId]) {
      usersOnPages[pageId] = usersOnPages[pageId].filter(user => user.socketId !== socket.id);

      // Emit the updated users list to the room
      io.to(pageId).emit('usersOnPage', usersOnPages[pageId]);
    }
  });


  socket.on('editPage', (data) => {
    console.log('Edit page event received:', data);
    redisClient.publish('page_updates', JSON.stringify(data));
  });

  socket.on('deletePage', ({ id, title }) => {
    console.log(`Page deleted: ${id} - ${title}`);
    io.emit('pageDeleted', { id, title });
    delete usersOnPage[id]; // Clean up users tracking
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');

    // Remove the user from all pages
    Object.keys(usersOnPages).forEach((pageId) => {
      usersOnPages[pageId] = usersOnPages[pageId].filter(user => user.socketId !== socket.id);
      io.to(pageId).emit('usersOnPage', usersOnPages[pageId]);
    });
  });
});

app.post('/api/real-time-updates', (req, res) => {
  const changes = req.body;
  console.log('Received real-time updates:', changes); // Add logging
  changes.forEach(change => {
    redisClient.publish('page_updates', JSON.stringify(change));
  });
  res.status(200).send('Changes broadcasted.');
});

app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q;
  if (!container) {
    return res.status(500).json({ error: 'Cosmos DB container is not initialized' });
  }

  try {
    const querySpec = {
      query: `
        SELECT c.id, c.title
        FROM c
        WHERE 
          EXISTS (SELECT VALUE i FROM i IN c.records.incidents WHERE i.incNumber = @searchQuery) OR
          EXISTS (SELECT VALUE chg FROM chg IN c.records.changes WHERE chg.chgNumber = @searchQuery) OR
          EXISTS (SELECT VALUE prb FROM prb IN c.records.problems WHERE prb.prbNumber = @searchQuery) OR
          EXISTS (SELECT VALUE sr FROM sr IN c.records.serviceRequests WHERE sr.ritmNumber = @searchQuery) OR
          EXISTS (SELECT VALUE mainPrbInc FROM mainPrbInc IN c.records.incidents WHERE Contains(mainPrbInc.mainProblem, @searchQuery)) OR
          EXISTS (SELECT VALUE notesInc FROM notesInc IN c.records.incidents WHERE Contains(notesInc.notes, @searchQuery)) OR
          EXISTS (SELECT VALUE notesPrb FROM notesPrb IN c.records.problems WHERE Contains(notesPrb.notes, @searchQuery)) OR
          EXISTS (SELECT VALUE rcaPrb FROM rcaPrb IN c.records.problems WHERE Contains(rcaPrb.rca, @searchQuery)) OR
          EXISTS (SELECT VALUE notesChg FROM notesChg IN c.records.changes WHERE Contains(notesChg.notes, @searchQuery)) OR
          EXISTS (SELECT VALUE notesSr FROM notesSr IN c.records.serviceRequests WHERE Contains(notesSr.notes, @searchQuery)) OR
          EXISTS (SELECT VALUE dscSr FROM dscSr IN c.records.serviceRequests WHERE Contains(dscSr.short_description, @searchQuery))
      `,
      parameters: [{ name: "@searchQuery", value: searchQuery }]
    };

    const { resources: items } = await container.items.query(querySpec).fetchAll();
    if (items.length > 0) {
      res.status(200).json(items);
    } else {
      res.status(404).json({ message: 'No results found' });
    }
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    //res.status(500).json({ error: error.message });
  }
});


app.post('/api/records', async (req, res) => {
  const { id, title, date, engineersOnShift, records, pageId } = req.body;
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const newRecord = { id, title, date, engineersOnShift, records, pageId };
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

      newDocument.records = {
        incidents: newDocument.records.incidents.filter(incident => incident.status !== 'Resolved'),
        problems: newDocument.records.problems.filter(problem => problem.status !== 'Resolved'),
        changes: newDocument.records.changes.filter(change => change.status !== 'Closed'),
        serviceRequests: newDocument.records.serviceRequests.filter(serviceRequest => serviceRequest.status !== 'Closed'),
      };

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
  const { lastEditedBy, ...updatedData } = req.body;

  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }

    const updatedDocument = {
      ...updatedData,
      lastEditedBy, // Include lastEditedBy in the updated document
    };
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
    await container.item(pageId, partitionKey).delete();
    res.status(204).send();
    io.emit('pageDeleted', { id: pageId });
  } catch (error) {
    console.error('Error deleting page:', error);
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

// get all clients
app.get('/api/clients', async (req, res) => {
  try {
    if (!clientsContainer) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const querySpec = {
      query: "SELECT * FROM c ORDER BY c._ts DESC"
    };
    const { resources: items } = await clientsContainer.items.query(querySpec).fetchAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:clientId', async (req, res) => {
  const clientId = req.params.clientId;
  try {
    if (!clientsContainer) {
      throw new Error('Cosmos DB container is not initialized');
    }

    const { resource: client } = await clientsContainer.item(clientId).read();
    
    // Log the result for debugging
    if (!client) {
      console.error('No client found with the specified ID:', clientId);
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Fetched client data:', client);

    res.status(200).json(client); // Ensure this is sending proper JSON
  } catch (error) {
    console.error('Error fetching client SLA quotas:', error.message);
    res.status(500).json({ error: error.message });
  }
});



app.put('/api/clients/:clientId', async (req, res) => {
  const clientId = req.params.clientId;
  const { slaQuotas } = req.body;
  
  try {
    const { resource: existingClient } = await clientsContainer.item(clientId).read();
    
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    existingClient.slaQuotas = slaQuotas; // Update the SLA quotas

    const { resource: updatedClient } = await clientsContainer.item(clientId).replace(existingClient);
    
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating SLA quotas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { client, slaQuotas } = req.body;

  if (!client || !slaQuotas) {
    return res.status(400).json({ error: 'Client name and SLA quotas are required.' });
  }

  const newClient = {
    id: uuidv4(),
    client,
    slaQuotas,
  };

  try {
    const { resources: existingClients } = await clientsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.client = @client',
        parameters: [{ name: '@client', value: client }]
      })
      .fetchAll();

    if (existingClients.length > 0) {
      return res.status(409).json({ error: 'A client with this name already exists.' });
    }

    // Add new client to Cosmos DB
    const { resource: createdClient } = await clientsContainer.items.create(newClient);
    res.status(201).json(createdClient); // Send back the created client data as confirmation
    io.emit('clientCreated', createdClient);
  } catch (error) {
    console.error('Error creating new client:', error);
    res.status(500).json({ error: 'Failed to create new client.' });
  }
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
