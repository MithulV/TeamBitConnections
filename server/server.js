const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();


app.use(cors());
app.use(bodyParser.json());

app.use('/auth', require('./routes/LoginRoute'));

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});