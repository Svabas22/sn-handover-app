require('dotenv').config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require("@azure/cosmos");
const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');
const morgan = require('morgan');
app.use(express.static(path.join(__dirname, '../client/dist')));

//console.log(process.env.DB_HOST); // Use environment variables like this

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;

const databaseId = "handoversys";
const containerId = "snRecords";

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

app.get('/api/records', async (req, res) => {
  try {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    const { resources: items } = await container.items
      .query("SELECT * from c")
      .fetchAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

