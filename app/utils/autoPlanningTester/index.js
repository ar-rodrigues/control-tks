/**
 * Auto-Planning Tester - Main Entry Point
 * Orchestrates the automatic planning generation for testing and analysis
 */

import { executeWeightedGreedyAssignment } from "./assignmentAlgorithm.js";
import {
  distributeAssignmentDates,
  validateDateDistribution,
} from "./dateDistributor.js";
import {
  AVAILABLE_CONSTRAINTS,
  getDefaultConstraintParameters,
} from "./constraintEngine.js";
import {
  exportToCSV,
  downloadFile,
  generateExportFilename,
  prepareExportData,
} from "./resultExporter.js";

/**
 * Main function to generate automatic planning
 * @param {Object} params - Planning parameters
 * @returns {Object} Complete planning results
 */
export async function generateAutomaticPlanning({
  locations,
  auditors,
  targetMonth,
  targetYear,
  existingPlannings = {},
  configuration = {},
}) {
  try {
    console.log("🚀 Iniciando planificación automática...");

    // Validate inputs
    validateInputs({ locations, auditors, targetMonth, targetYear });

    // Merge configuration with defaults
    const config = mergeWithDefaults(configuration);

    console.log("📊 Configuración:", config);
    console.log(
      `📅 Planificando para: ${getMonthName(targetMonth)} ${targetYear}`
    );
    console.log(
      `📍 Ubicaciones activas: ${
        locations.filter((l) => l.is_active !== false).length
      }/${locations.length}`
    );
    console.log(`👥 Auditores disponibles: ${auditors.length}`);

    // Step 1: Execute assignment algorithm
    console.log("🎯 Ejecutando algoritmo de asignación...");
    const assignmentResults = await executeWeightedGreedyAssignment({
      locations,
      auditors,
      existingPlannings,
      targetMonth,
      targetYear,
      enabledConstraints: config.enabledConstraints,
      constraintParameters: config.constraintParameters,
      algorithmWeights: config.algorithmWeights,
    });

    console.log(
      `✅ Asignaciones completadas: ${assignmentResults.assignments.length}`
    );
    console.log(
      `⚠️ Ubicaciones no asignadas: ${assignmentResults.unassignedLocations.length}`
    );

    // Step 2: Distribute dates
    console.log("📅 Distribuyendo fechas...");
    const assignmentsWithDates = distributeAssignmentDates(
      assignmentResults.assignments,
      targetMonth,
      targetYear,
      config.dateDistributionOptions
    );

    // Step 3: Validate date distribution
    const dateValidation = validateDateDistribution(
      assignmentsWithDates,
      config.dateDistributionOptions
    );

    if (!dateValidation.isValid) {
      console.warn(
        "⚠️ Problemas detectados en la distribución de fechas:",
        dateValidation.issues
      );
    }

    // Step 4: Prepare final results
    const finalResults = {
      assignments: assignmentsWithDates,
      unassignedLocations: assignmentResults.unassignedLocations,
      metrics: assignmentResults.metrics,
      warnings: assignmentResults.warnings,
      dateValidation,
      configuration: config,
      summary: generateSummary(
        assignmentResults,
        assignmentsWithDates,
        targetMonth,
        targetYear
      ),
    };

    console.log("✨ Planificación automática completada exitosamente");
    return finalResults;
  } catch (error) {
    console.error("❌ Error en planificación automática:", error);
    throw new Error(`Error en planificación automática: ${error.message}`);
  }
}

/**
 * Export planning results and trigger download
 * @param {Object} results - Planning results
 * @param {Array} auditors - Auditor data
 * @param {Array} locations - Location data
 * @param {number} month - Target month
 * @param {number} year - Target year
 * @param {Object} exportOptions - Export options
 */
export async function exportAndDownloadResults(
  results,
  auditors,
  locations,
  month,
  year,
  exportOptions = {}
) {
  try {
    console.log("📄 Preparando exportación...");

    // Prepare complete export data
    const exportData = prepareExportData(results, auditors, locations);

    // Generate CSV content
    const csvContent = exportToCSV(exportData, exportOptions);

    // Generate filename
    const filename = generateExportFilename(month, year, "csv");

    // Trigger download
    downloadFile(csvContent, filename);

    console.log(`💾 Archivo descargado: ${filename}`);

    return {
      success: true,
      filename,
      recordCount: exportData.assignments.length,
    };
  } catch (error) {
    console.error("❌ Error en exportación:", error);
    throw new Error(`Error en exportación: ${error.message}`);
  }
}

/**
 * Get available constraints for configuration
 * @returns {Object} Available constraints
 */
export function getAvailableConstraints() {
  return AVAILABLE_CONSTRAINTS;
}

/**
 * Get default configuration
 * @returns {Object} Default configuration
 */
export function getDefaultConfiguration() {
  return {
    enabledConstraints: [
      "maxDistanceLimit",
      "zonePreference",
      "workloadBalance",
      "subsidiaryGrouping",
    ],
    constraintParameters: getDefaultConstraintParameters(),
    algorithmWeights: {
      distance: 0.4,
      zoneMatch: 0.3,
      workload: 0.2,
      constraints: 0.1,
    },
    dateDistributionOptions: {
      minDaysBetweenVisits: 2,
      avoidWeekends: true,
      distributeEvenly: true,
      groupSubsidiaries: true,
      maxVisitsPerDay: 3,
    },
  };
}

/**
 * Validate input parameters
 * @param {Object} params - Input parameters
 */
function validateInputs({ locations, auditors, targetMonth, targetYear }) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("Se requiere un array de ubicaciones válido");
  }

  if (!Array.isArray(auditors) || auditors.length === 0) {
    throw new Error("Se requiere un array de auditores válido");
  }

  if (typeof targetMonth !== "number" || targetMonth < 0 || targetMonth > 11) {
    throw new Error("El mes objetivo debe ser un número entre 0 y 11");
  }

  if (
    typeof targetYear !== "number" ||
    targetYear < 2020 ||
    targetYear > 2030
  ) {
    throw new Error("El año objetivo debe ser válido");
  }

  // Validate that auditors have coordinates
  const auditorsWithoutCoords = auditors.filter(
    (a) => !a.home_address_coordinates?.lat || !a.home_address_coordinates?.lon
  );

  if (auditorsWithoutCoords.length > 0) {
    console.warn(
      "⚠️ Auditores sin coordenadas:",
      auditorsWithoutCoords.map((a) => a.full_name)
    );
  }

  // Validate that locations have coordinates
  const locationsWithoutCoords = locations.filter(
    (l) => !l.location_coordinates?.lat || !l.location_coordinates?.lon
  );

  if (locationsWithoutCoords.length > 0) {
    console.warn(
      "⚠️ Ubicaciones sin coordenadas:",
      locationsWithoutCoords.length
    );
  }
}

/**
 * Merge user configuration with defaults
 * @param {Object} userConfig - User configuration
 * @returns {Object} Merged configuration
 */
function mergeWithDefaults(userConfig) {
  const defaultConfig = getDefaultConfiguration();

  return {
    enabledConstraints:
      userConfig.enabledConstraints || defaultConfig.enabledConstraints,
    constraintParameters: {
      ...defaultConfig.constraintParameters,
      ...userConfig.constraintParameters,
    },
    algorithmWeights: {
      ...defaultConfig.algorithmWeights,
      ...userConfig.algorithmWeights,
    },
    dateDistributionOptions: {
      ...defaultConfig.dateDistributionOptions,
      ...userConfig.dateDistributionOptions,
    },
  };
}

/**
 * Generate summary of planning results
 * @param {Object} assignmentResults - Assignment results
 * @param {Array} assignmentsWithDates - Assignments with dates
 * @param {number} month - Target month
 * @param {number} year - Target year
 * @returns {Object} Summary object
 */
function generateSummary(assignmentResults, assignmentsWithDates, month, year) {
  const totalAssignments = assignmentResults.assignments.length;
  const totalUnassigned = assignmentResults.unassignedLocations.length;
  const totalLocations = totalAssignments + totalUnassigned;
  const assignmentsWithValidDates = assignmentsWithDates.filter(
    (a) => a.audit_date
  ).length;

  return {
    targetPeriod: `${getMonthName(month)} ${year}`,
    totalLocations,
    totalAssignments,
    totalUnassigned,
    assignmentRate:
      totalLocations > 0
        ? Math.round((totalAssignments / totalLocations) * 100)
        : 0,
    assignmentsWithDates: assignmentsWithValidDates,
    dateAssignmentRate:
      totalAssignments > 0
        ? Math.round((assignmentsWithValidDates / totalAssignments) * 100)
        : 0,
    averageDistance: assignmentResults.metrics.averageDistance,
    averageConfidence: Math.round(
      assignmentResults.metrics.averageConfidence * 100
    ),
    constraintViolations: assignmentResults.metrics.constraintViolations,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get month name in Spanish
 * @param {number} month - Month index (0-11)
 * @returns {string} Month name
 */
function getMonthName(month) {
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return monthNames[month] || "Mes inválido";
}

/**
 * Get algorithm performance metrics
 * @param {Object} results - Planning results
 * @returns {Object} Performance metrics
 */
export function getPerformanceMetrics(results) {
  return {
    efficiency: {
      assignmentRate: results.summary.assignmentRate,
      dateAssignmentRate: results.summary.dateAssignmentRate,
      averageConfidence: results.summary.averageConfidence,
    },
    quality: {
      averageDistance: results.summary.averageDistance,
      constraintViolations: results.summary.constraintViolations,
      workloadBalance: calculateWorkloadBalance(
        results.metrics.workloadDistribution
      ),
    },
    coverage: {
      totalLocations: results.summary.totalLocations,
      assignedLocations: results.summary.totalAssignments,
      unassignedLocations: results.summary.totalUnassigned,
    },
  };
}

/**
 * Calculate workload balance score
 * @param {Array} workloadDistribution - Distribution of assignments per auditor
 * @returns {number} Balance score (higher is better)
 */
function calculateWorkloadBalance(workloadDistribution) {
  if (!workloadDistribution || workloadDistribution.length === 0) return 0;

  const mean =
    workloadDistribution.reduce((sum, count) => sum + count, 0) /
    workloadDistribution.length;
  const variance =
    workloadDistribution.reduce(
      (sum, count) => sum + Math.pow(count - mean, 2),
      0
    ) / workloadDistribution.length;
  const stdDev = Math.sqrt(variance);

  // Convert to balance score (lower std dev = higher score)
  const maxPossibleStdDev = mean; // Worst case scenario
  return maxPossibleStdDev > 0
    ? Math.max(0, 100 - (stdDev / maxPossibleStdDev) * 100)
    : 100;
}
