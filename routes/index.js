const express = require('express');

const utils = require('./util');
const testApi = require('./testApi');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Generoute-Server is up and running!');
});

router.get('/coordinates', testApi.generateCoordAPI);
router.get('/landUse', testApi.getLandUseDataAPI);
router.get('/rectangleRoute', testApi.generateRectangleRouteAPI);

module.exports = router;
