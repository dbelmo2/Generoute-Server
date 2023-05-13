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
    console.log(error);
    res.send(error.message).status(400);
  }
};

module.exports = {
  generateCoordAPI,
  getLandUseDataAPI,
};
