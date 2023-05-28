const NodeGeocoder = require('node-geocoder');
// eslint-disable-next-line import/no-extraneous-dependencies
const turf = require('@turf/turf');
const axios = require('axios');

const logger = require('../logger');
const config = require('../config.json');
const keys = require('../keys.json');

const directionsBaseUrl = 'https://api.mapbox.com/directions/v5/mapbox/walking';
const OVERPASS_INTERPRETER_API = process.env.OVERPASS_INTERPRETER_API || 'http://overpass-api.de/api/interpreter?data=';
const { PUBLIC_LAND_USE } = config;

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
    logger.info(error.message);
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
function getRandomPointWithinDistance(startPoint, fixedDistance) {
  const bearing = Math.random() * 360; // random bearing in degrees
  const options = { units: 'kilometers' };
  return turf.destination(startPoint, fixedDistance, bearing, options).geometry.coordinates;
}

// Connect points with walkable routes
async function connectPointsWithRoutes(points) {
  const coordinates = points.map((point) => point.join(',')).join(';');
  let response;
  let data;
  logger.info('Coordinates:');
  logger.info(coordinates);
  try {
    response = await axios.get(`${directionsBaseUrl}/${coordinates}?geometries=geojson&access_token=${keys.MAPBOX}`);
    data = response.data;
  } catch (error) {
    logger.info(`Error when calling Mapbox Directions API: ${error.message}`);
    logger.info(JSON.stringify(error.response?.data));
    throw error;
  }
  return data.routes[0].geometry.coordinates;
}

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
    logger.info(`Error when calling OverPass API: ${error.message}`);
    logger.info(JSON.stringify(error.response?.data));
    throw error;
  }
  return landuse;
};

/**
 * Takes a string in the form of "-87.848374,43.334344" and returns an array of numbers 
 * where containing both coordinates in the same order.
 * @param {*} coordString - A string containing a lat and lon coordiante.
 * @returns An array.
 */
function parseCoordinates(coordString) {
  const coords = coordString.split(',').map(Number);
  return coords;
}
/**
 * Converts an array of numbers containing two coordinates and returns string
 * with both coordinates in the following format: "-87.848374,43.334344". 
 * @param {Array} coords - An array containing a lat and lon coordinate in index 0 and 1.
 * @returns The formatted string.
 */
function stringifyCoordinates(coords) {
  return coords.join(',');
}

async function generateRectangleRoute(startPoint, length, width) {
  // Convert side lengths from km to degree
  const lengthInLat = width / 111.32; // convert km to degree for latitude
  const lengthInLng = length / (111.32 * Math.cos(startPoint[1] * Math.PI / 180)); // convert km to degree for longitude

  const secondPoint = [`${startPoint[0] + lengthInLng},${startPoint[1]}`];
  const thirdPoint = [`${startPoint[0] + lengthInLng},${startPoint[1] + lengthInLat}`];
  const fourthPoint = [`${startPoint[0]},${startPoint[1] + lengthInLat}`];
  startPoint = [`${startPoint[0]},${startPoint[1]}`];
  const points = [startPoint, secondPoint, thirdPoint, fourthPoint, startPoint];
  const originalCoordinates = points.slice(0, -1).map((point) => parseCoordinates(point[0]));

  points.forEach(async (point) => {

  });

  points = points.map(async (point) => {
    try {
      const tempPoint = parseCoordinates(point);
      const lat = tempPoint[1];
      const lon = tempPoint[0];
      const landUse = await getLandUseData(lat, lon);
      if (!PUBLIC_LAND_USE.includes(landUse)) {
        const address = await coordinatesToAddress(lat, lon);
        const publicCoordinates = await generateCoord(address);
        tempPoint[0] = publicCoordinates.longitude;
        tempPoint[1] = publicCoordinates.latitude;
        point = stringifyCoordinates(tempPoint);
      }
    } catch (error) {
    }
  })


  
  const routeCoordinates = await connectPointsWithRoutes(points);
  const response = {};
  response.route = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };
  response.originalCoordinates = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: originalCoordinates,
    },
  };
  return response;
}

module.exports = {
  generateCoord,
  generateDistanceRoute,
  getLandUseData,
  coordinatesToAddress,
  generateRectangleRoute,
};
