// api functions for testing
const logger = require('../logger');
const util = require('./util');

const FILE_NAME = 'testApi.js';

const getLandUseDataAPI = async (req, res) => {
  try {
    const result = await util.getLandUseData(req.query.latitude, req.query.longitude);
    res.send(result);
  } catch (error) {
    logger.info(error);
    res.send(error.message).status(400);
  }
};

const generateCoordAPI = async (req, res) => {
  try {
    const result = await util.generateCoord(req.query.address);
    res.send(result);
  } catch (error) {
    res.send(error.message).status(400);
  }
};

const generateRectangleRouteAPI = async (req, res) => {
  try {
    logger.info(`Received address: ${req.query.address}`, FILE_NAME);
    const startCoords = await util.generateCoord(req.query.address);
    logger.info('start coordinates');
    logger.info(startCoords);
    const kmInMile = 1.60934;
    const lengthInKm = req.query.length * kmInMile;
    logger.info(`Received a request for a route with a total length of ${req.query.length} Miles or ${lengthInKm} KM`);
    logger.info(`Length for each side: ${lengthInKm / 4} KM`);
    const routeData = await util.generateRectangleRoute([startCoords.longitude, startCoords.latitude], lengthInKm / 4, lengthInKm / 4);
    util.getRouteDistance(routeData.route.geometry.coordinates);
    res.json(routeData);
  } catch (error) {
    logger.info('Error occured while generating rectangle route.');
    console.log(error);
    res.json({ message: error.message }).status(400);
  }
};

const getDistanceAPI = (req, res) => {
  try {
    const {
      latOne, latTwo, lonOne, lonTwo,
    } = req.query;
    logger.info(`Calculating distance between lat 1: ${latOne} lon 1: ${lonOne}, lat 2: ${latTwo} lon 2: ${lonTwo}`);
    const result = util.getDistanceFromLatLonInKm(latOne, lonOne, latTwo, lonTwo);
    logger.info(`Distance calculated: ${result}`);
    res.send(`${result}`);
  } catch (error) {
    logger.info(`Error occured while calculating the distance: ${error.message}`);
    res.json({ message: error.message }).status(400);
  }
};
module.exports = {
  generateCoordAPI,
  getLandUseDataAPI,
  generateRectangleRouteAPI,
  getDistanceAPI,
};
