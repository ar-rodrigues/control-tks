/**
 * Constraint Engine for Auto-Planning System
 * Defines and evaluates planning constraints
 */

// Available constraints configuration
export const AVAILABLE_CONSTRAINTS = {
  matrizRevisitPrevention: {
    name: "Evitar re-auditoría de matriz",
    description:
      "Un auditor no puede auditar la misma matriz en meses consecutivos",
    type: "hard",
    configurable: true,
    parameters: {
      lookbackMonths: {
        type: "number",
        default: 1,
        min: 1,
        max: 6,
        label: "Meses de retroactividad",
      },
    },
  },

  maxDistanceLimit: {
    name: "Límite de distancia máxima",
    description: "Auditor no puede ser asignado más allá de X km",
    type: "hard",
    configurable: true,
    parameters: {
      maxDistanceKm: {
        type: "number",
        default: 200,
        min: 50,
        max: 500,
        label: "Distancia máxima (km)",
      },
    },
  },

  zonePreference: {
    name: "Preferencia por zona asignada",
    description: "Priorizar auditores en su zona asignada",
    type: "soft",
    configurable: true,
    parameters: {
      preferenceWeight: {
        type: "slider",
        default: 0.7,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        label: "Peso de preferencia",
      },
    },
  },

  workloadBalance: {
    name: "Balance de carga de trabajo",
    description: "Distribuir asignaciones equitativamente",
    type: "soft",
    configurable: true,
    parameters: {
      strictBalance: {
        type: "boolean",
        default: true,
        label: "Balance estricto",
      },
      maxVariance: {
        type: "number",
        default: 2,
        min: 1,
        max: 5,
        label: "Variación máxima de asignaciones",
      },
    },
  },

  dateDistribution: {
    name: "Distribución temporal",
    description: "Evitar clustering de fechas",
    type: "soft",
    configurable: true,
    parameters: {
      minDaysBetweenVisits: {
        type: "number",
        default: 2,
        min: 1,
        max: 7,
        label: "Días mínimos entre visitas",
      },
    },
  },

  subsidiaryGrouping: {
    name: "Agrupación de subsidiarias",
    description: "Asignar matriz y subsidiarias al mismo auditor",
    type: "soft",
    configurable: true,
    parameters: {
      groupingWeight: {
        type: "slider",
        default: 0.8,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        label: "Peso de agrupación",
      },
    },
  },
};

/**
 * Evaluate matriz revisit constraint
 * @param {Object} auditor - Auditor object
 * @param {Object} location - Location object
 * @param {Object} context - Context with historical data
 * @returns {boolean} True if constraint is satisfied
 */
export function evaluateMatrizRevisitConstraint(auditor, location, context) {
  const { existingPlannings, targetMonth, targetYear, parameters } = context;
  const lookbackMonths = parameters.lookbackMonths || 1;

  // Only apply to matriz locations
  if (!location.es_matriz) return true;

  // Check previous months
  for (let i = 1; i <= lookbackMonths; i++) {
    let checkMonth = targetMonth - i;
    let checkYear = targetYear;

    if (checkMonth < 0) {
      checkMonth = 12 + checkMonth;
      checkYear = targetYear - 1;
    }

    const previousAssignment = existingPlannings[location.id]?.[checkMonth];
    if (previousAssignment?.auditor_id === auditor.id) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluate maximum distance constraint
 * @param {Object} auditor - Auditor object
 * @param {Object} location - Location object
 * @param {Object} context - Context with distance data
 * @returns {boolean} True if constraint is satisfied
 */
export function evaluateMaxDistanceConstraint(auditor, location, context) {
  const { distanceMatrix, parameters } = context;
  const maxDistance = parameters.maxDistanceKm || 200;

  const distance = distanceMatrix[auditor.id][location.id];
  return distance <= maxDistance;
}

/**
 * Calculate zone preference score
 * @param {Object} auditor - Auditor object
 * @param {Object} location - Location object
 * @param {Object} context - Context with parameters
 * @returns {number} Score between 0 and 1
 */
export function calculateZonePreferenceScore(auditor, location, context) {
  const { parameters } = context;
  const preferenceWeight = parameters.preferenceWeight || 0.7;

  if (auditor.zone === location.zona) {
    return preferenceWeight;
  } else {
    return 1 - preferenceWeight;
  }
}

/**
 * Calculate workload balance score
 * @param {Object} auditor - Auditor object
 * @param {Object} context - Context with current assignments
 * @returns {number} Score between 0 and 1
 */
export function calculateWorkloadBalanceScore(auditor, context) {
  const { currentAssignments, totalLocations, totalAuditors, parameters } =
    context;
  const strictBalance = parameters.strictBalance !== false;

  const currentWorkload = currentAssignments[auditor.id] || 0;
  const idealWorkload = Math.floor(totalLocations / totalAuditors);
  const maxVariance = parameters.maxVariance || 2;

  if (strictBalance) {
    const difference = Math.abs(currentWorkload - idealWorkload);
    return Math.max(0, 1 - difference / maxVariance);
  } else {
    // Prefer auditors with less current workload
    const maxWorkload = Math.max(...Object.values(currentAssignments));
    return maxWorkload === 0 ? 1 : 1 - currentWorkload / maxWorkload;
  }
}

/**
 * Calculate subsidiary grouping score
 * @param {Object} auditor - Auditor object
 * @param {Object} location - Location object
 * @param {Object} context - Context with current assignments
 * @returns {number} Score between 0 and 1
 */
export function calculateSubsidiaryGroupingScore(auditor, location, context) {
  const { currentAssignments, locations, parameters } = context;
  const groupingWeight = parameters.groupingWeight || 0.8;

  // Find matriz for this convenio
  const matrizLocation = locations.find(
    (loc) => loc.convenio === location.convenio && loc.es_matriz
  );

  if (!matrizLocation) return 0.5; // Neutral score if no matriz found

  // Check if this auditor is already assigned to the matriz
  const matrizAssignment = Object.values(currentAssignments).find(
    (assignment) =>
      assignment.location_id === matrizLocation.id &&
      assignment.auditor_id === auditor.id
  );

  if (matrizAssignment) {
    return groupingWeight; // High score for grouping subsidiaries with matriz
  } else if (location.es_matriz) {
    return 0.5; // Neutral for matriz locations
  } else {
    return 1 - groupingWeight; // Lower score for splitting convenio
  }
}

/**
 * Evaluate all constraints for an auditor-location pair
 * @param {Object} auditor - Auditor object
 * @param {Object} location - Location object
 * @param {Object} context - Context with all necessary data
 * @param {Array} enabledConstraints - List of enabled constraint names
 * @returns {Object} {isValid, score, violations}
 */
export function evaluateConstraints(
  auditor,
  location,
  context,
  enabledConstraints
) {
  const violations = [];
  let score = 1.0;
  let isValid = true;

  enabledConstraints.forEach((constraintName) => {
    const constraint = AVAILABLE_CONSTRAINTS[constraintName];
    if (!constraint) return;

    const constraintContext = {
      ...context,
      parameters: context.constraintParameters[constraintName] || {},
    };

    switch (constraintName) {
      case "matrizRevisitPrevention":
        if (
          !evaluateMatrizRevisitConstraint(auditor, location, constraintContext)
        ) {
          if (constraint.type === "hard") {
            isValid = false;
          }
          violations.push(
            `Auditor ${auditor.full_name} auditó matriz ${location.convenio} el mes anterior`
          );
          score *= 0.1; // Heavy penalty
        }
        break;

      case "maxDistanceLimit":
        if (
          !evaluateMaxDistanceConstraint(auditor, location, constraintContext)
        ) {
          if (constraint.type === "hard") {
            isValid = false;
          }
          const distance = context.distanceMatrix[auditor.id][location.id];
          violations.push(`Distancia ${distance}km excede el límite`);
          score *= 0.1; // Heavy penalty
        }
        break;

      case "zonePreference":
        const zoneScore = calculateZonePreferenceScore(
          auditor,
          location,
          constraintContext
        );
        score *= zoneScore;
        break;

      case "workloadBalance":
        const workloadScore = calculateWorkloadBalanceScore(
          auditor,
          constraintContext
        );
        score *= workloadScore;
        break;

      case "subsidiaryGrouping":
        const groupingScore = calculateSubsidiaryGroupingScore(
          auditor,
          location,
          constraintContext
        );
        score *= groupingScore;
        break;
    }
  });

  return {
    isValid,
    score: Math.max(0, Math.min(1, score)), // Clamp between 0 and 1
    violations,
  };
}

/**
 * Get default parameters for all constraints
 * @returns {Object} Default parameters
 */
export function getDefaultConstraintParameters() {
  const params = {};

  Object.keys(AVAILABLE_CONSTRAINTS).forEach((constraintName) => {
    const constraint = AVAILABLE_CONSTRAINTS[constraintName];
    params[constraintName] = {};

    Object.keys(constraint.parameters).forEach((paramName) => {
      params[constraintName][paramName] =
        constraint.parameters[paramName].default;
    });
  });

  return params;
}
