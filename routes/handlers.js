const utils = require('./util');
const config = require('../config.json');

const { PUBLIC_LAND_USE } = config;

// Generate a random walkable route
const getRandomRoute = async (req, res) => {
  const startPoint = [req.query.longitude, req.query.latitude];
  const points = [
    startPoint,
    utils.getRandomPointWithinDistance(),
    utils.getRandomPointWithinDistance(),
    startPoint,
  ];

  points.forEach(async (point) => {
    const lat = point[1];
    const lon = point[0];
    const landUse = await utils.getLandUseData(lat, lon);
    if (!PUBLIC_LAND_USE.includes(landUse)) {
      const address = await utils.coordinatesToAddress(lat, lon);
      const publicCoordinates = await utils.generateCoord(address);
      point[0] = publicCoordinates.longitude;
      point[1] = publicCoordinates.latitude;
    }
  });

  const routeCoordinates = await utils.connectPointsWithRoutes(points);
  const routeData = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };
  res.json(routeData);
};

module.exports = {
  getRandomRoute,
};
