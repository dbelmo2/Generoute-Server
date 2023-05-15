// api functions for testing
const util = require('./util');

const getLandUseDataAPI = async (req, res) => {
  try {
    const result = await util.getLandUseData(req.query.latitude, req.query.longitude);
    res.send(result);
  } catch (error) {
    console.log(error);
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
    console.log(`Received address: ${req.query.address}`);
    const startCoords = await util.generateCoord(req.query.address);
    console.log('start coordinates');
    console.log(startCoords);
    const kmInMile = 1.60934;
    const lengthInKm = req.query.length * kmInMile;
    console.log(`Converted length of ${req.query.length} miles to ${lengthInKm} Km`);
    console.log(`Length for each side: ${lengthInKm / 4} KM`);
    const routeData = await util.generateRectangleRoute([startCoords.longitude, startCoords.latitude], lengthInKm / 4, lengthInKm / 4);
    res.json(routeData);
  } catch (error) {
    console.log('Error occured while generating rectangle route.');
    res.json({ message: error.message }).status(400);
  }

};
module.exports = {
  generateCoordAPI,
  getLandUseDataAPI,
  generateRectangleRouteAPI,
};
