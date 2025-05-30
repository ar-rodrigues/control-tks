/**
 * Assignment Algorithm for Auto-Planning System
 * Implements weighted greedy assignment with constraint evaluation
 */

import { buildDistanceMatrix } from "./distanceCalculator.js";
import { evaluateConstraints } from "./constraintEngine.js";

/**
 * Main assignment algorithm using weighted greedy approach
 * @param {Object} params - Algorithm parameters
 * @returns {Object} Assignment results
 */
export async function executeWeightedGreedyAssignment({
  locations,
  auditors,
  existingPlannings,
  targetMonth,
  targetYear,
  enabledConstraints,
  constraintParameters,
  algorithmWeights,
}) {
  // Filter active locations only
  const activeLocations = locations.filter((loc) => loc.is_active !== false);

  // Build distance matrix
  const distanceMatrix = buildDistanceMatrix(auditors, activeLocations);

  // Initialize tracking structures
  const assignments = [];
  const currentAssignments = {};
  const unassignedLocations = [];
  const warnings = [];

  // Initialize auditor workload tracking
  auditors.forEach((auditor) => {
    currentAssignments[auditor.id] = 0;
  });

  // Sort locations: matrices first, then by distance to closest auditor
  const sortedLocations = sortLocationsByPriority(
    activeLocations,
    auditors,
    distanceMatrix
  );

  // Process each location
  for (const location of sortedLocations) {
    const assignment = findBestAssignment({
      location,
      auditors,
      distanceMatrix,
      existingPlannings,
      targetMonth,
      targetYear,
      enabledConstraints,
      constraintParameters,
      algorithmWeights,
      currentAssignments,
      locations: activeLocations,
    });

    if (assignment) {
      assignments.push(assignment);
      currentAssignments[assignment.auditor_id]++;
    } else {
      unassignedLocations.push({
        location,
        reason: "No se encontró auditor válido según las restricciones",
      });
      warnings.push(`Ubicación ${location.convenio} no pudo ser asignada`);
    }
  }

  // Calculate metrics
  const metrics = calculateAssignmentMetrics(
    assignments,
    unassignedLocations,
    auditors,
    distanceMatrix
  );

  return {
    assignments,
    unassignedLocations,
    metrics,
    warnings,
  };
}

/**
 * Sort locations by assignment priority
 * @param {Array} locations - Array of location objects
 * @param {Array} auditors - Array of auditor objects
 * @param {Object} distanceMatrix - Pre-calculated distances
 * @returns {Array} Sorted locations
 */
function sortLocationsByPriority(locations, auditors, distanceMatrix) {
  return locations.sort((a, b) => {
    // Matrices have higher priority
    if (a.es_matriz && !b.es_matriz) return -1;
    if (!a.es_matriz && b.es_matriz) return 1;

    // Then sort by minimum distance to any auditor
    const minDistanceA = Math.min(
      ...auditors.map((auditor) => distanceMatrix[auditor.id][a.id] || Infinity)
    );
    const minDistanceB = Math.min(
      ...auditors.map((auditor) => distanceMatrix[auditor.id][b.id] || Infinity)
    );

    return minDistanceA - minDistanceB;
  });
}

/**
 * Find the best auditor assignment for a location
 * @param {Object} params - Assignment parameters
 * @returns {Object|null} Assignment object or null if no valid assignment
 */
function findBestAssignment({
  location,
  auditors,
  distanceMatrix,
  existingPlannings,
  targetMonth,
  targetYear,
  enabledConstraints,
  constraintParameters,
  algorithmWeights,
  currentAssignments,
  locations,
}) {
  let bestAuditor = null;
  let bestScore = -1;
  let bestEvaluation = null;

  // Evaluate each auditor for this location
  auditors.forEach((auditor) => {
    const distance = distanceMatrix[auditor.id][location.id];

    // Skip if no valid coordinates
    if (distance === Infinity) return;

    // Create context for constraint evaluation
    const context = {
      distanceMatrix,
      existingPlannings,
      targetMonth,
      targetYear,
      constraintParameters,
      currentAssignments: { [auditor.id]: currentAssignments[auditor.id] },
      totalLocations: locations.length,
      totalAuditors: auditors.length,
      locations,
    };

    // Evaluate constraints
    const evaluation = evaluateConstraints(
      auditor,
      location,
      context,
      enabledConstraints
    );

    // Skip if hard constraints are violated
    if (!evaluation.isValid) return;

    // Calculate weighted score
    const weightedScore = calculateWeightedScore({
      evaluation,
      distance,
      auditor,
      location,
      currentAssignments,
      algorithmWeights,
    });

    // Update best assignment if this is better
    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestAuditor = auditor;
      bestEvaluation = evaluation;
    }
  });

  if (!bestAuditor) return null;

  return {
    location_id: location.id,
    auditor_id: bestAuditor.id,
    auditor_name: bestAuditor.full_name,
    location_name: location.convenio,
    distance_km: distanceMatrix[bestAuditor.id][location.id],
    confidence_score: bestScore,
    constraint_violations: bestEvaluation.violations,
    assignment_reason: generateAssignmentReason(
      bestAuditor,
      location,
      bestEvaluation
    ),
  };
}

/**
 * Calculate weighted score for an auditor-location pair
 * @param {Object} params - Scoring parameters
 * @returns {number} Weighted score
 */
function calculateWeightedScore({
  evaluation,
  distance,
  auditor,
  location,
  currentAssignments,
  algorithmWeights,
}) {
  const weights = {
    distance: algorithmWeights.distance || 0.4,
    zoneMatch: algorithmWeights.zoneMatch || 0.3,
    workload: algorithmWeights.workload || 0.2,
    constraints: algorithmWeights.constraints || 0.1,
  };

  // Distance score (closer is better, normalize to 0-1)
  const maxReasonableDistance = 300; // km
  const distanceScore = Math.max(0, 1 - distance / maxReasonableDistance);

  // Zone matching score
  const zoneScore = auditor.zone === location.zona ? 1 : 0.3;

  // Workload balance score (prefer less loaded auditors)
  const currentWorkload = currentAssignments[auditor.id] || 0;
  const maxWorkload = Math.max(...Object.values(currentAssignments), 1);
  const workloadScore = 1 - currentWorkload / maxWorkload;

  // Constraint satisfaction score
  const constraintScore = evaluation.score;

  // Calculate weighted total
  const totalScore =
    distanceScore * weights.distance +
    zoneScore * weights.zoneMatch +
    workloadScore * weights.workload +
    constraintScore * weights.constraints;

  return totalScore;
}

/**
 * Generate human-readable assignment reason
 * @param {Object} auditor - Assigned auditor
 * @param {Object} location - Assigned location
 * @param {Object} evaluation - Constraint evaluation result
 * @returns {string} Assignment reason
 */
function generateAssignmentReason(auditor, location, evaluation) {
  const reasons = [];

  if (auditor.zone === location.zona) {
    reasons.push("zona coincidente");
  }

  if (evaluation.score > 0.8) {
    reasons.push("alta compatibilidad");
  } else if (evaluation.score > 0.6) {
    reasons.push("buena compatibilidad");
  }

  if (evaluation.violations.length === 0) {
    reasons.push("sin restricciones violadas");
  }

  return reasons.length > 0 ? reasons.join(", ") : "mejor opción disponible";
}

/**
 * Calculate assignment metrics
 * @param {Array} assignments - Completed assignments
 * @param {Array} unassignedLocations - Locations that couldn't be assigned
 * @param {Array} auditors - All auditors
 * @param {Object} distanceMatrix - Distance matrix
 * @returns {Object} Metrics object
 */
function calculateAssignmentMetrics(
  assignments,
  unassignedLocations,
  auditors,
  distanceMatrix
) {
  if (assignments.length === 0) {
    return {
      totalAssignments: 0,
      averageDistance: 0,
      averageConfidence: 0,
      workloadDistribution: [],
      constraintViolations: 0,
      unassignedCount: unassignedLocations.length,
      assignmentRate: 0,
    };
  }

  // Calculate average distance
  const totalDistance = assignments.reduce(
    (sum, assignment) => sum + assignment.distance_km,
    0
  );
  const averageDistance =
    Math.round((totalDistance / assignments.length) * 100) / 100;

  // Calculate average confidence
  const totalConfidence = assignments.reduce(
    (sum, assignment) => sum + assignment.confidence_score,
    0
  );
  const averageConfidence =
    Math.round((totalConfidence / assignments.length) * 100) / 100;

  // Calculate workload distribution
  const workloadCounts = {};
  auditors.forEach((auditor) => {
    workloadCounts[auditor.id] = 0;
  });

  assignments.forEach((assignment) => {
    workloadCounts[assignment.auditor_id]++;
  });

  const workloadDistribution = Object.values(workloadCounts);

  // Count constraint violations
  const constraintViolations = assignments.reduce(
    (count, assignment) => count + assignment.constraint_violations.length,
    0
  );

  // Calculate assignment rate
  const totalLocations = assignments.length + unassignedLocations.length;
  const assignmentRate =
    totalLocations > 0
      ? Math.round((assignments.length / totalLocations) * 100)
      : 0;

  return {
    totalAssignments: assignments.length,
    averageDistance,
    averageConfidence,
    workloadDistribution,
    constraintViolations,
    unassignedCount: unassignedLocations.length,
    assignmentRate,
  };
}
