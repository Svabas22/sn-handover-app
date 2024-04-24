const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

require('dotenv').config();
console.log(process.env.DB_HOST); // Use environment variables like this


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
