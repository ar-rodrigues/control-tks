/**
 * Result Exporter for Auto-Planning System
 * Exports planning results to Excel/CSV format
 */

/**
 * Export planning results to CSV format
 * @param {Object} results - Planning results
 * @param {Object} options - Export options
 * @returns {string} CSV content
 */
export function exportToCSV(results, options = {}) {
  const {
    includeSummary = true,
    includeMetrics = true,
    includeUnassigned = true,
    includeWorkload = true,
  } = options;

  let csvContent = "";

  // Add header information
  if (includeSummary) {
    csvContent += generateSummarySection(results);
    csvContent += "\n\n";
  }

  // Add main assignments
  csvContent += generateAssignmentsSection(results.assignments);

  // Add metrics section
  if (includeMetrics && results.metrics) {
    csvContent += "\n\n";
    csvContent += generateMetricsSection(results.metrics);
  }

  // Add workload distribution
  if (includeWorkload && results.auditorWorkloads) {
    csvContent += "\n\n";
    csvContent += generateWorkloadSection(results.auditorWorkloads);
  }

  // Add unassigned locations
  if (includeUnassigned && results.unassignedLocations?.length > 0) {
    csvContent += "\n\n";
    csvContent += generateUnassignedSection(results.unassignedLocations);
  }

  return csvContent;
}

/**
 * Generate summary section for CSV
 * @param {Object} results - Planning results
 * @returns {string} CSV summary section
 */
function generateSummarySection(results) {
  const timestamp = new Date().toLocaleString("es-ES");

  return [
    '"RESUMEN DE PLANIFICACIÓN AUTOMÁTICA"',
    `"Generado el:","${timestamp}"`,
    `"Total de asignaciones:","${results.assignments.length}"`,
    `"Ubicaciones no asignadas:","${results.unassignedLocations?.length || 0}"`,
    `"Tasa de asignación:","${results.metrics?.assignmentRate || 0}%"`,
    `"Distancia promedio:","${results.metrics?.averageDistance || 0} km"`,
    `"Confianza promedio:","${(
      results.metrics?.averageConfidence * 100 || 0
    ).toFixed(1)}%"`,
  ].join("\n");
}

/**
 * Generate assignments section for CSV
 * @param {Array} assignments - Assignment data
 * @returns {string} CSV assignments section
 */
function generateAssignmentsSection(assignments) {
  const headers = [
    "Cliente",
    "Convenio",
    "Zona",
    "Auditor Asignado",
    "Fecha Planificada",
    "Distancia (km)",
    "Puntuación de Confianza",
    "Razón de Asignación",
    "Restricciones Violadas",
  ];

  let section = '"ASIGNACIONES"\n';
  section += headers.map((h) => `"${h}"`).join(",") + "\n";

  assignments.forEach((assignment) => {
    const row = [
      assignment.cliente || "",
      assignment.location_name || "",
      assignment.zona || "",
      assignment.auditor_name || "",
      assignment.audit_date
        ? assignment.audit_date.toLocaleDateString("es-ES")
        : "",
      assignment.distance_km || "",
      assignment.confidence_score
        ? (assignment.confidence_score * 100).toFixed(1) + "%"
        : "",
      assignment.assignment_reason || "",
      assignment.constraint_violations?.join("; ") || "",
    ];

    section += row.map((field) => `"${field}"`).join(",") + "\n";
  });

  return section;
}

/**
 * Generate metrics section for CSV
 * @param {Object} metrics - Metrics data
 * @returns {string} CSV metrics section
 */
function generateMetricsSection(metrics) {
  let section = '"MÉTRICAS DE RENDIMIENTO"\n';
  section += '"Métrica","Valor"\n';

  const metricsData = [
    ["Total de asignaciones", metrics.totalAssignments],
    ["Distancia promedio", `${metrics.averageDistance} km`],
    ["Confianza promedio", `${(metrics.averageConfidence * 100).toFixed(1)}%`],
    ["Ubicaciones no asignadas", metrics.unassignedCount],
    ["Tasa de asignación", `${metrics.assignmentRate}%`],
    ["Restricciones violadas", metrics.constraintViolations],
    [
      "Desviación estándar de carga",
      calculateWorkloadStdDev(metrics.workloadDistribution).toFixed(2),
    ],
  ];

  metricsData.forEach(([metric, value]) => {
    section += `"${metric}","${value}"\n`;
  });

  return section;
}

/**
 * Generate workload section for CSV
 * @param {Array} auditorWorkloads - Auditor workload data
 * @returns {string} CSV workload section
 */
function generateWorkloadSection(auditorWorkloads) {
  let section = '"DISTRIBUCIÓN DE CARGA DE TRABAJO"\n';
  section +=
    '"Auditor","Asignaciones","Distancia Total (km)","Promedio por Visita (km)"\n';

  auditorWorkloads.forEach((workload) => {
    const avgDistance =
      workload.totalDistance > 0 && workload.assignmentCount > 0
        ? (workload.totalDistance / workload.assignmentCount).toFixed(1)
        : "0";

    const row = [
      workload.auditorName,
      workload.assignmentCount,
      workload.totalDistance.toFixed(1),
      avgDistance,
    ];

    section += row.map((field) => `"${field}"`).join(",") + "\n";
  });

  return section;
}

/**
 * Generate unassigned section for CSV
 * @param {Array} unassignedLocations - Unassigned locations data
 * @returns {string} CSV unassigned section
 */
function generateUnassignedSection(unassignedLocations) {
  let section = '"UBICACIONES NO ASIGNADAS"\n';
  section += '"Cliente","Convenio","Zona","Razón"\n';

  unassignedLocations.forEach((item) => {
    const location = item.location;
    const row = [
      location.cliente || "",
      location.convenio || "",
      location.zona || "",
      item.reason || "Razón no especificada",
    ];

    section += row.map((field) => `"${field}"`).join(",") + "\n";
  });

  return section;
}

/**
 * Calculate standard deviation of workload distribution
 * @param {Array} workloadDistribution - Array of workload counts
 * @returns {number} Standard deviation
 */
function calculateWorkloadStdDev(workloadDistribution) {
  if (!workloadDistribution || workloadDistribution.length === 0) return 0;

  const mean =
    workloadDistribution.reduce((sum, count) => sum + count, 0) /
    workloadDistribution.length;
  const variance =
    workloadDistribution.reduce(
      (sum, count) => sum + Math.pow(count - mean, 2),
      0
    ) / workloadDistribution.length;

  return Math.sqrt(variance);
}

/**
 * Trigger file download in browser
 * @param {string} content - File content
 * @param {string} filename - Filename for download
 * @param {string} contentType - MIME type
 */
export function downloadFile(
  content,
  filename,
  contentType = "text/csv;charset=utf-8;"
) {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 * @param {number} month - Target month (0-11)
 * @param {number} year - Target year
 * @param {string} format - File format (csv, excel)
 * @returns {string} Generated filename
 */
export function generateExportFilename(month, year, format = "csv") {
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const timestamp = new Date().toISOString().split("T")[0];
  const monthName = monthNames[month];

  return `planificacion_automatica_${monthName}_${year}_${timestamp}.${format}`;
}

/**
 * Prepare complete export data
 * @param {Object} planningResults - Results from auto-planning
 * @param {Array} auditors - Auditor data for workload calculation
 * @param {Array} locations - Location data for additional info
 * @returns {Object} Complete export data
 */
export function prepareExportData(planningResults, auditors, locations) {
  // Calculate auditor workloads
  const auditorWorkloads = calculateAuditorWorkloads(
    planningResults.assignments,
    auditors
  );

  // Enhance assignments with location data
  const enhancedAssignments = planningResults.assignments.map((assignment) => {
    const location = locations.find((loc) => loc.id === assignment.location_id);
    return {
      ...assignment,
      cliente: location?.cliente,
      zona: location?.zona,
      es_matriz: location?.es_matriz,
    };
  });

  return {
    ...planningResults,
    assignments: enhancedAssignments,
    auditorWorkloads,
  };
}

/**
 * Calculate workload distribution by auditor
 * @param {Array} assignments - Assignment data
 * @param {Array} auditors - Auditor data
 * @returns {Array} Workload data by auditor
 */
function calculateAuditorWorkloads(assignments, auditors) {
  const workloads = {};

  // Initialize workloads
  auditors.forEach((auditor) => {
    workloads[auditor.id] = {
      auditorId: auditor.id,
      auditorName: auditor.full_name,
      assignmentCount: 0,
      totalDistance: 0,
      assignments: [],
    };
  });

  // Aggregate assignment data
  assignments.forEach((assignment) => {
    const workload = workloads[assignment.auditor_id];
    if (workload) {
      workload.assignmentCount++;
      workload.totalDistance += assignment.distance_km || 0;
      workload.assignments.push(assignment);
    }
  });

  return Object.values(workloads);
}
