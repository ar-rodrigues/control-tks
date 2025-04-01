import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

// GET /api/work-sessions/admin
// Get all work sessions (admin access only)
export async function GET(request) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from("profile_roles")
      .select("role_name")
      .eq("id", user.id)
      .single();

    if (roleError || !userRole || userRole.role_name !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const profileId = url.searchParams.get("profileId");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build query to get all work sessions
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

    // Apply filters if provided
    if (startDate) {
      query = query.gte("check_in", startDate);
    }

    if (endDate) {
      query = query.lte("check_in", endDate);
    }

    if (profileId) {
      query = query.eq("profile_id", profileId);
    }

    // Execute query
    const { data: allWorkSessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error("Error fetching work sessions:", sessionsError);
      return NextResponse.json(
        { error: sessionsError.message },
        { status: 500 }
      );
    }

    // Process data to aggregate by day and employee
    const sessionsByDay = {};

    allWorkSessions.forEach((session) => {
      // Extract date part from check_in timestamp
      const sessionDate = session.check_in.split("T")[0];

      if (!sessionsByDay[sessionDate]) {
        sessionsByDay[sessionDate] = {
          work_session_date: sessionDate,
          employees_sessions: [],
        };
      }

      // Find if employee already has sessions for this day
      const employeeIndex = sessionsByDay[
        sessionDate
      ].employees_sessions.findIndex(
        (emp) => emp.profile_id === session.profile_id
      );

      if (employeeIndex === -1) {
        // First session for this employee on this day
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
        // Add to existing employee's sessions for this day
        const employeeData =
          sessionsByDay[sessionDate].employees_sessions[employeeIndex];

        // Add session to the list
        employeeData.sessions.push({
          id: session.id,
          check_in: session.check_in,
          check_in_location: session.check_in_location,
          check_out: session.check_out,
          check_out_location: session.check_out_location,
          total_hours: session.total_hours,
        });

        // Update first check-in if this one is earlier
        if (session.check_in < employeeData.first_check_in) {
          employeeData.first_check_in = session.check_in;
          employeeData.first_check_in_location = session.check_in_location;
        }

        // Update last check-out if this one is later
        if (
          session.check_out &&
          (!employeeData.last_check_out ||
            session.check_out > employeeData.last_check_out)
        ) {
          employeeData.last_check_out = session.check_out;
          employeeData.last_check_out_location = session.check_out_location;
        }

        // Recalculate total hours (this is simplified and might need adjustment)
        // A more accurate calculation would parse the interval strings and add them
        if (session.total_hours && employeeData.total_hours) {
          // This is a placeholder - in a real app you'd need to properly add time intervals
          employeeData.total_hours = session.total_hours; // This should be the sum of all sessions
        }
      }
    });

    // Convert to array and apply pagination
    const adminWorkSessions = Object.values(sessionsByDay)
      .sort((a, b) => b.work_session_date.localeCompare(a.work_session_date))
      .slice(offset, offset + limit);

    const totalCount = Object.keys(sessionsByDay).length;

    return NextResponse.json({
      adminWorkSessions,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/work-sessions/admin:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
