const express = require('express');


const utils = require('./util');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('Got request!');
  res.send('Generoute-Server is up and running!');
});

router.get('/coordinates', utils.generateCoord);

module.exports = router;
