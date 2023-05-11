const NodeGeocoder = require('node-geocoder');
// eslint-disable-next-line import/no-extraneous-dependencies
const turf = require('@turf/turf');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

const generateCoord = async (req, res) => {
  try {
    const { address } = req.query;
    const results = await geocoder.geocode(address);
    if (results.length === 0) {
      throw new Error('No results found for address');
    }
    const { latitude, longitude } = results[0];
    res.status(200).json({ latitude, longitude });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const generateDistanceRoute = async (req, res) => {
  const { lat, lng, distance } = req.body;

  if (!lat || !lng || !distance) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  const from = turf.point([parseFloat(lng), parseFloat(lat)]);
  const options = { units: 'miles' };
  const to = turf.destination(from, distance, 90, options);

  res.json({ lat: to.geometry.coordinates[1], lng: to.geometry.coordinates[0] });
};

module.exports = {
  generateCoord,
  generateDistanceRoute,
};
