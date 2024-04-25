require('dotenv').config();
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

const client = new CosmosClient({ endpoint, key });
app.use(morgan('combined'));
app.get('/status', (req,res) =>{
  res.send(
    {
      message: 'hello'
    }
  )
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

