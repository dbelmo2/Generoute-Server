const express = require('express');
const cors = require('cors');
const logger = require('./logger');


const router = require('./routes/index');

const app = express();
const port = 3000;

app.use(cors());
app.use(router);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, function expressListener(){
  logger.info(`Server is listening at http://localhost:${port}`, 'app.js');
});
