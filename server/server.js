require('dotenv').config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const express = require('express');
const cors = require('cors');
const path = require('path');
var session = require('express-session');
var createError = require('http-errors');
const http = require('http');
const socketIo = require('socket.io');
var cookieParser = require('cookie-parser');

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

console.log(process.env.ENVR === 'production');

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
app.post('/api/records', async (req, res) => {
  const { name, comment } = req.body;
  try {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    const { resource: createdItem } = await container.items.create({ name, comment });
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



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

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
// });

// app.get('/api/records', async (req, res) => {
//   try {
//     const { database } = await client.databases.createIfNotExists({ id: databaseId });
//     const { container } = await database.containers.createIfNotExists({ id: containerId });
//     const { resources: items } = await container.items
//       .query("SELECT * from c")
//       .fetchAll();
//     res.status(200).json(items);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get('/api/records', async (req, res) => {
  try {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    const querySpec = {
      query: "SELECT c.id, c.title FROM c ORDER BY c.date DESC"  // Sorting by date descending
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records/:id', async (req, res) => {
  const pageId = req.params.id;
  try {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @pageId",
      parameters: [
        { name: "@pageId", value: pageId }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(items[0]);  // assuming the ID is unique and returns a single item
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

