/**
 * Distance Calculator for Auto-Planning System
 * Uses Haversine formula to calculate distances between coordinates
 */

/**
 * Calculate the distance between two points on Earth using Haversine formula
 * @param {Object} point1 - First coordinate {lat, lon}
 * @param {Object} point2 - Second coordinate {lat, lon}
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(point1, point2) {
  if (
    !point1 ||
    !point2 ||
    !point1.lat ||
    !point1.lon ||
    !point2.lat ||
    !point2.lon
  ) {
    return Infinity; // Return infinity if coordinates are missing
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lon - point1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Build a distance matrix between all auditors and locations
 * @param {Array} auditors - Array of auditor objects
 * @param {Array} locations - Array of location objects
 * @returns {Object} Matrix with distances
 */
export function buildDistanceMatrix(auditors, locations) {
  const matrix = {};

  auditors.forEach((auditor) => {
    matrix[auditor.id] = {};

    locations.forEach((location) => {
      const auditorCoords = auditor.home_address_coordinates;
      const locationCoords = location.location_coordinates;

      matrix[auditor.id][location.id] = calculateHaversineDistance(
        auditorCoords,
        locationCoords
      );
    });
  });

  return matrix;
}

/**
 * Find the closest auditor to a location
 * @param {Object} location - Location object
 * @param {Array} auditors - Array of auditor objects
 * @param {Object} distanceMatrix - Pre-calculated distance matrix
 * @returns {Object} {auditor, distance}
 */
export function findClosestAuditor(location, auditors, distanceMatrix) {
  let closestAuditor = null;
  let minDistance = Infinity;

  auditors.forEach((auditor) => {
    const distance = distanceMatrix[auditor.id][location.id];
    if (distance < minDistance) {
      minDistance = distance;
      closestAuditor = auditor;
    }
  });

  return {
    auditor: closestAuditor,
    distance: minDistance,
  };
}

/**
 * Filter auditors by maximum distance constraint
 * @param {Object} location - Location object
 * @param {Array} auditors - Array of auditor objects
 * @param {Object} distanceMatrix - Pre-calculated distance matrix
 * @param {number} maxDistance - Maximum allowed distance in km
 * @returns {Array} Filtered auditors within distance
 */
export function filterAuditorsByDistance(
  location,
  auditors,
  distanceMatrix,
  maxDistance
) {
  return auditors.filter((auditor) => {
    const distance = distanceMatrix[auditor.id][location.id];
    return distance <= maxDistance;
  });
}
