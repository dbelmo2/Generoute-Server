const NodeGeocoder = require('node-geocoder');
// eslint-disable-next-line import/no-extraneous-dependencies
const turf = require('@turf/turf');
const axios = require('axios');

const directionsBaseUrl = 'https://api.mapbox.com/directions/v5/mapbox/walking';
const startPoint = [-87.88592846064543, 41.879536552845245];
const fixedDistance = 1; // 1km

const OVERPASS_INTERPRETER_API = process.env.OVERPASS_INTERPRETER_API || 'http://overpass-api.de/api/interpreter?data=';

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

/**
 * Converts the provided addresss into a set of coordinates.
 * @param {String} address - An address.
 * @returns An object containing lat and lon
 */
const generateCoord = async (address) => {
  try {
    const results = await geocoder.geocode(address);
    if (results.length === 0) {
      throw new Error('No results found for address');
    }
    const { latitude, longitude } = results[0];
    return { latitude, longitude };
  } catch (error) {
    console.log(error);
  }
};

/**
 * Converts a set of coordinates to an address.
 * @param {String} lat - latitude
 * @param {*} lon - longitude
 * @returns Returns an address if found
 */
const coordinatesToAddress = async (lat, lon) => {
  try {
    const res = await geocoder.reverse({ lat, lon });
    return res[0].formattedAddress;
  } catch (error) {
    console.error(error);
    return null;
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

// Generate a random point within a fixed distance from the starting point
function getRandomPointWithinDistance() {
  const bearing = Math.random() * 360; // random bearing in degrees
  const options = { units: 'kilometers' };
  return turf.destination(startPoint, fixedDistance, bearing, options).geometry.coordinates;
}

// Connect points with walkable routes
const connectPointsWithRoutes = async (points) => {
  const coordinates = points.map((point) => point.join(',')).join(';');
  const response = await fetch(`${directionsBaseUrl}/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`);
  const data = await response.json();
  return data.routes[0].geometry.coordinates;
};

/**
 * Returns the landuse value of the location which the provided coordiantes map to.
 * @param {String} latitude - Latitude value
 * @param {String} longitude - Longitude value
 * @returns - The landuse value of the provided location
 */
const getLandUseData = async (latitude, longitude) => {
  const overpassQuery = `
    [out:json];
    is_in(${latitude},${longitude});
    out tags;
  `;
  let landuse;
  try {
    const response = await axios.get(`${OVERPASS_INTERPRETER_API}${encodeURIComponent(overpassQuery)}`);
    landuse = response.data.elements[1]?.tags.landuse; // TODO: Refactor to iterate all elements and search for landuse?
  } catch (error) {
    console.log(error);
    throw error;
  }
  return landuse;
};

module.exports = {
  generateCoord,
  generateDistanceRoute,
  getLandUseData,
  coordinatesToAddress,
};
