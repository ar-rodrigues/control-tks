/**
 * Date Distributor for Auto-Planning System
 * Assigns dates to audit assignments within the target month
 */

/**
 * Distribute dates for assignments within a month
 * @param {Array} assignments - Array of assignment objects
 * @param {number} targetMonth - Target month (0-11)
 * @param {number} targetYear - Target year
 * @param {Object} options - Date distribution options
 * @returns {Array} Assignments with assigned dates
 */
export function distributeAssignmentDates(
  assignments,
  targetMonth,
  targetYear,
  options = {}
) {
  const {
    minDaysBetweenVisits = 2,
    avoidWeekends = true,
    distributeEvenly = true,
    groupSubsidiaries = true,
  } = options;

  // Get working days in the month
  const workingDays = getWorkingDaysInMonth(
    targetYear,
    targetMonth,
    avoidWeekends
  );

  if (workingDays.length === 0) {
    throw new Error(
      `No hay días laborables disponibles en el mes ${
        targetMonth + 1
      }/${targetYear}`
    );
  }

  // Group assignments by auditor for better distribution
  const assignmentsByAuditor = groupAssignmentsByAuditor(assignments);

  // Track assigned dates per auditor
  const auditorSchedules = {};

  // Process each auditor's assignments
  Object.keys(assignmentsByAuditor).forEach((auditorId) => {
    auditorSchedules[auditorId] = [];
    const auditorAssignments = assignmentsByAuditor[auditorId];

    // Group by convenio if subsidiary grouping is enabled
    const groupedAssignments = groupSubsidiaries
      ? groupAssignmentsByConvenio(auditorAssignments)
      : auditorAssignments.map((assignment) => [assignment]);

    // Distribute dates for this auditor
    distributeAuditorDates(
      groupedAssignments,
      auditorSchedules[auditorId],
      workingDays,
      minDaysBetweenVisits,
      distributeEvenly
    );
  });

  // Apply dates to assignments
  return assignments.map((assignment) => {
    const auditorSchedule = auditorSchedules[assignment.auditor_id];
    const dateEntry = auditorSchedule.find((entry) =>
      entry.assignmentIds.includes(assignment.location_id)
    );

    return {
      ...assignment,
      audit_date: dateEntry ? dateEntry.date : null,
      date_assignment_reason: dateEntry
        ? dateEntry.reason
        : "No se pudo asignar fecha",
    };
  });
}

/**
 * Get working days in a month (excluding weekends if specified)
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {boolean} avoidWeekends - Whether to exclude weekends
 * @returns {Array} Array of Date objects for working days
 */
function getWorkingDaysInMonth(year, month, avoidWeekends = true) {
  const workingDays = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Skip weekends if avoidWeekends is true
    if (avoidWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }

    workingDays.push(date);
  }

  return workingDays;
}

/**
 * Group assignments by auditor ID
 * @param {Array} assignments - Array of assignment objects
 * @returns {Object} Assignments grouped by auditor ID
 */
function groupAssignmentsByAuditor(assignments) {
  return assignments.reduce((groups, assignment) => {
    const auditorId = assignment.auditor_id;
    if (!groups[auditorId]) {
      groups[auditorId] = [];
    }
    groups[auditorId].push(assignment);
    return groups;
  }, {});
}

/**
 * Group assignments by convenio (for subsidiary grouping)
 * @param {Array} assignments - Array of assignment objects
 * @returns {Array} Array of assignment groups
 */
function groupAssignmentsByConvenio(assignments) {
  const convenioGroups = {};

  assignments.forEach((assignment) => {
    const convenio = assignment.location_name; // Using convenio as grouping key
    if (!convenioGroups[convenio]) {
      convenioGroups[convenio] = [];
    }
    convenioGroups[convenio].push(assignment);
  });

  return Object.values(convenioGroups);
}

/**
 * Distribute dates for a single auditor's assignments
 * @param {Array} assignmentGroups - Groups of assignments to schedule together
 * @param {Array} auditorSchedule - Auditor's schedule to populate
 * @param {Array} workingDays - Available working days
 * @param {number} minDaysBetween - Minimum days between visits
 * @param {boolean} distributeEvenly - Whether to distribute evenly across month
 */
function distributeAuditorDates(
  assignmentGroups,
  auditorSchedule,
  workingDays,
  minDaysBetween,
  distributeEvenly
) {
  if (assignmentGroups.length === 0) return;

  let availableDays = [...workingDays];
  let currentDateIndex = 0;

  // Calculate spacing if distributing evenly
  const spacing = distributeEvenly
    ? Math.max(
        minDaysBetween,
        Math.floor(availableDays.length / assignmentGroups.length)
      )
    : minDaysBetween;

  assignmentGroups.forEach((group, groupIndex) => {
    // Find next available date
    let selectedDate;
    let dateReason = "distribución automática";

    if (distributeEvenly) {
      // Try to space evenly across the month
      const targetIndex = Math.min(
        currentDateIndex + spacing,
        availableDays.length - (assignmentGroups.length - groupIndex)
      );
      selectedDate = availableDays[Math.max(currentDateIndex, targetIndex)];
      currentDateIndex = targetIndex + 1;
      dateReason = "distribución uniforme";
    } else {
      // Use next available date with minimum spacing
      selectedDate = availableDays[currentDateIndex];
      currentDateIndex = Math.min(
        currentDateIndex + spacing,
        availableDays.length - 1
      );
      dateReason = "siguiente fecha disponible";
    }

    if (selectedDate) {
      // For subsidiary groups, assign same or consecutive dates
      if (group.length > 1) {
        // Multiple locations (matriz + subsidiaries)
        group.forEach((assignment, assignmentIndex) => {
          const assignmentDate =
            assignmentIndex === 0
              ? selectedDate
              : getNextAvailableDate(
                  selectedDate,
                  assignmentIndex,
                  availableDays
                );

          auditorSchedule.push({
            date: assignmentDate,
            assignmentIds: [assignment.location_id],
            reason:
              assignmentIndex === 0
                ? `${dateReason} - matriz`
                : `${dateReason} - subsidiaria`,
          });
        });
      } else {
        // Single location
        auditorSchedule.push({
          date: selectedDate,
          assignmentIds: [group[0].location_id],
          reason: dateReason,
        });
      }
    }
  });
}

/**
 * Get next available date for subsidiary assignments
 * @param {Date} baseDate - Base date to start from
 * @param {number} offset - Days to offset from base date
 * @param {Array} availableDays - Available working days
 * @returns {Date} Next available date
 */
function getNextAvailableDate(baseDate, offset, availableDays) {
  const baseIndex = availableDays.findIndex(
    (date) => date.getTime() === baseDate.getTime()
  );

  if (baseIndex === -1) return baseDate;

  const targetIndex = Math.min(baseIndex + offset, availableDays.length - 1);
  return availableDays[targetIndex];
}

/**
 * Validate and adjust date distribution
 * @param {Array} assignments - Assignments with dates
 * @param {Object} options - Validation options
 * @returns {Object} Validation results and suggestions
 */
export function validateDateDistribution(assignments, options = {}) {
  const { minDaysBetweenVisits = 2, maxVisitsPerDay = 3 } = options;

  const issues = [];
  const suggestions = [];

  // Group by auditor and date
  const scheduleByAuditorAndDate = {};

  assignments.forEach((assignment) => {
    if (!assignment.audit_date) return;

    const auditorId = assignment.auditor_id;
    const dateKey = assignment.audit_date.toDateString();

    if (!scheduleByAuditorAndDate[auditorId]) {
      scheduleByAuditorAndDate[auditorId] = {};
    }

    if (!scheduleByAuditorAndDate[auditorId][dateKey]) {
      scheduleByAuditorAndDate[auditorId][dateKey] = [];
    }

    scheduleByAuditorAndDate[auditorId][dateKey].push(assignment);
  });

  // Check for violations
  Object.keys(scheduleByAuditorAndDate).forEach((auditorId) => {
    const auditorSchedule = scheduleByAuditorAndDate[auditorId];
    const dates = Object.keys(auditorSchedule).sort();

    // Check max visits per day
    dates.forEach((dateKey) => {
      const visitsOnDate = auditorSchedule[dateKey];
      if (visitsOnDate.length > maxVisitsPerDay) {
        issues.push({
          type: "excessive_daily_visits",
          auditorId,
          date: dateKey,
          count: visitsOnDate.length,
          limit: maxVisitsPerDay,
        });
      }
    });

    // Check minimum days between visits
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currentDate = new Date(dates[i]);
      const daysBetween = Math.floor(
        (currentDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (daysBetween < minDaysBetweenVisits) {
        issues.push({
          type: "insufficient_spacing",
          auditorId,
          date1: dates[i - 1],
          date2: dates[i],
          daysBetween,
          minimumRequired: minDaysBetweenVisits,
        });
      }
    }
  });

  // Generate suggestions based on issues
  if (issues.length > 0) {
    suggestions.push(
      "Considere ajustar los parámetros de distribución de fechas"
    );
    suggestions.push("Revise las asignaciones con conflictos de calendario");
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    totalAssignmentsWithDates: assignments.filter((a) => a.audit_date).length,
    totalAssignments: assignments.length,
  };
}
