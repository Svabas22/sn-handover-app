require('dotenv').config();
if (process.env.ENVR === 'dev') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}

const express = require('express');
const cors = require('cors');
const path = require('path');
var session = require('express-session');
var createError = require('http-errors');
const http = require('http');
const socketIo = require('socket.io');
var cookieParser = require('cookie-parser');
const handoverTemplate = require('./template-page.json');

const morgan = require('morgan');
const redis = require('redis');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
const RedisStore = require('connect-redis').default;
const { CosmosClient } = require("@azure/cosmos");
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = "handoversys";
const containerId = "snRecords";

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


const redisClient = redis.createClient({
  url: process.env.REDIS_KEY,
  //legacyMode: true,
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
      secure: process.env.ENVR === 'production', // set this to true on production
  }
}));

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

//Cosmos DB config
const client = new CosmosClient({ endpoint, key });
app.use(morgan('combined'));


async function initializeCosmosDB() {
  try {
    database = (await client.databases.createIfNotExists({ id: databaseId })).database;
    container = (await database.containers.createIfNotExists({ id: containerId })).container;
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
  }
}

initializeCosmosDB();

// app.post('/api/records', async (req, res) => {
//   const { name, comment } = req.body;
//   try {
//     const { resource: createdItem } = await container.items.create({ name, comment });
//     res.status(201).json(createdItem);
//     io.emit('pageCreated', createdItem); // Emit event to all clients
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


io.on('connection', (socket) => {
  console.log('A user connected');

  // Listening for an event from the client about the new record
  socket.on('createRecord', (newRecord) => {
      // Here you can also add the new record to the database if not already done

      // Broadcast the new record to all clients except the sender
      socket.broadcast.emit('recordCreated', newRecord);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

app.set('trust proxy', 1); 

app.post('/api/records', async (req, res) => {
  const { id, title, date, engineersOnShift, clients, pageId } = req.body; // Ensure pageId is included in the request body
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const newRecord = { id, title, date, engineersOnShift, clients, pageId };
    const { resource: createdItem } = await container.items.create(newRecord);
    res.status(201).json(createdItem);
    io.emit('pageCreated', createdItem); // Emit event to all clients
    
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
    res.status500().json({ error: error.message });
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
          delete newDocument.id; // Ensure a new document ID is created by Cosmos DB

          let today = new Date();
          newDocument.date = today.toISOString().split('T')[0];
          newDocument.title = `Handover ${newDocument.date} - ${today.getHours() >= 3 && today.getHours() < 15 ? 'Day' : 'Night'}`;

          const { resource: createdItem } = await container.items.create(newDocument);
          res.status(201).send(`New document created with id: ${createdItem.id}`);
      } else {
          res.status(404).send('No existing documents found to clone.');
      }
  } catch (error) {
      console.error(`An error occurred: ${error}`);
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
        const latestDocument = items[0];
        let newDocument = { ...handoverTemplate };
        delete newDocument.id; // Ensure a new document ID is created by Cosmos DB

        let today = new Date();
        newDocument.date = today.toISOString().split('T')[0];
        newDocument.title = `Handover ${newDocument.date} - ${today.getHours() >= 3 && today.getHours() < 15 ? 'Day' : 'Night'}`;

        const { resource: createdItem } = await container.items.create(newDocument);
        res.status(201).send(`New document created with id: ${createdItem.id}`);
    } else {
        res.status(404).send('No existing documents found to clone.');
    }
  } catch (error) {
      console.error(`An error occurred: ${error}`);
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
    const partitionKey = updatedDocument.pageId; // Ensure the partition key is in the updated document
    const { resource: doc } = await container.item(pageId, partitionKey).replace(updatedDocument);
    res.status(200).json(doc);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  const pageId = req.params.id;
  const partitionKey = req.body.pageId; // Ensure the partition key is provided in the request body
  try {
    if (!container) {
      throw new Error('Cosmos DB container is not initialized');
    }
    const { resource: result } = await container.item(pageId, partitionKey).delete();
    if (result) {
      res.status(204).send(); // No Content, deletion successful
    }
  } catch (error) {
    console.error('Failed to delete record:', error);
    res.status(500).json({ error: "An internal error occurred while deleting the record." });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

