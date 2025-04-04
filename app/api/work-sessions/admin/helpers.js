import { createClient } from "../../../utils/supabase/server";
import { checkBackendPermission } from "@/app/utils/permissions";

// Helper function to validate user authentication and permissions
export const validateUserPermissions = async (user) => {
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const supabase = createClient();
  const { data: userRole, error: roleError } = await supabase
    .from("profile_roles")
    .select("role_name")
    .eq("id", user.id)
    .single();

  if (roleError || !userRole || userRole.role_name !== "admin") {
    const hasPermission = await checkBackendPermission(user, ["admin", "rh"]);
    if (!hasPermission) {
      return { error: "Forbidden - Insufficient permissions", status: 403 };
    }
  }

  return { error: null };
};

// Helper function to build the query with filters
export const buildWorkSessionsQuery = (supabase, params) => {
  const { startDate, endDate, profileId } = params;

  let query = supabase
    .from("work_sessions")
    .select(
      `
      *,
      profiles:profile_id (
        id,
        full_name,
        email
      )
    `
    )
    .order("check_in", { ascending: false });

  if (startDate) {
    query = query.gte("check_in", startDate);
  }

  if (endDate) {
    query = query.lte("check_in", endDate);
  }

  if (profileId) {
    query = query.eq("profile_id", profileId);
  }

  return query;
};

// Helper function to process and aggregate work sessions
export const processWorkSessions = (allWorkSessions) => {
  const sessionsByDay = {};

  allWorkSessions.forEach((session) => {
    const sessionDate = session.check_in.split("T")[0];

    if (!sessionsByDay[sessionDate]) {
      sessionsByDay[sessionDate] = {
        work_session_date: sessionDate,
        employees_sessions: [],
      };
    }

    const employeeIndex = sessionsByDay[
      sessionDate
    ].employees_sessions.findIndex(
      (emp) => emp.profile_id === session.profile_id
    );

    if (employeeIndex === -1) {
      sessionsByDay[sessionDate].employees_sessions.push({
        id: session.id,
        profile_id: session.profile_id,
        profile_name: session.profiles?.full_name || "Unknown",
        work_session_date: sessionDate,
        first_check_in: session.check_in,
        first_check_in_location: session.check_in_location,
        last_check_out: session.check_out,
        last_check_out_location: session.check_out_location,
        total_hours: session.total_hours || "00:00:00",
        sessions: [
          {
            id: session.id,
            check_in: session.check_in,
            check_in_location: session.check_in_location,
            check_out: session.check_out,
            check_out_location: session.check_out_location,
            total_hours: session.total_hours,
          },
        ],
      });
    } else {
      const employeeData =
        sessionsByDay[sessionDate].employees_sessions[employeeIndex];

      employeeData.sessions.push({
        id: session.id,
        check_in: session.check_in,
        check_in_location: session.check_in_location,
        check_out: session.check_out,
        check_out_location: session.check_out_location,
        total_hours: session.total_hours,
      });

      if (session.check_in < employeeData.first_check_in) {
        employeeData.first_check_in = session.check_in;
        employeeData.first_check_in_location = session.check_in_location;
      }

      if (
        session.check_out &&
        (!employeeData.last_check_out ||
          session.check_out > employeeData.last_check_out)
      ) {
        employeeData.last_check_out = session.check_out;
        employeeData.last_check_out_location = session.check_out_location;
      }

      if (session.total_hours && employeeData.total_hours) {
        employeeData.total_hours = session.total_hours;
      }
    }
  });

  return sessionsByDay;
};

// Helper function to paginate results
export const paginateResults = (sessionsByDay, offset, limit) => {
  return Object.values(sessionsByDay)
    .sort((a, b) => b.work_session_date.localeCompare(a.work_session_date))
    .slice(offset, offset + limit);
};
