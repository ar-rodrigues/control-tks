import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import {
  validateUserPermissions,
  buildWorkSessionsQuery,
  processWorkSessions,
  paginateResults,
} from "./helpers";

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

    // Validate user permissions
    const { error: permissionError, status } = await validateUserPermissions(
      user
    );
    if (permissionError) {
      return NextResponse.json({ error: permissionError }, { status });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const params = {
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      profileId: url.searchParams.get("profileId"),
    };
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build and execute query
    const query = buildWorkSessionsQuery(supabase, params);
    const { data: allWorkSessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error("Error fetching work sessions:", sessionsError);
      return NextResponse.json(
        { error: sessionsError.message },
        { status: 500 }
      );
    }

    // Process and paginate results
    const sessionsByDay = processWorkSessions(allWorkSessions);
    const adminWorkSessions = paginateResults(sessionsByDay, offset, limit);

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
