import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import {
  getCurrentTimeInMX,
  toMXDateString,
  calculateTimeDifference,
} from "../../utils/dates/formatDateMX";
import moment from "moment-timezone";

// GET /api/work-sessions
// Get the current active work session or the most recent work session for the authenticated user
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

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const today = toMXDateString(new Date());
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;

    // First, try to find an active session for today (where check_out is null)
    let { data: activeSession, error: activeSessionError } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("profile_id", profile.id)
      .is("check_out", null)
      .gte("check_in", startOfDay)
      .lte("check_in", endOfDay)
      .order("check_in", { ascending: false })
      .limit(1)
      .single();

    if (activeSessionError && activeSessionError.code !== "PGRST116") {
      console.error("Error fetching active session:", activeSessionError);
      return NextResponse.json(
        { error: activeSessionError.message },
        { status: 500 }
      );
    }

    // If active session found, return it
    if (activeSession) {
      return NextResponse.json({ workSession: activeSession });
    }

    // If no active session, try to get the most recent completed session for today
    const { data: latestSession, error: latestSessionError } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("check_in", startOfDay)
      .lte("check_in", endOfDay)
      .order("check_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSessionError) {
      console.error("Error fetching latest session:", latestSessionError);
      return NextResponse.json(
        { error: latestSessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ workSession: latestSession || null });
  } catch (error) {
    console.error("Unexpected error in GET /api/work-sessions:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST /api/work-sessions - Check In
export async function POST(request) {
  try {
    const supabase = createClient();
    const { check_in_location } = await request.json();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const now = getCurrentTimeInMX();
    const today = toMXDateString(now);

    // Check if there's already an active session for this user today
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;

    const { data: existingSession, error: existingSessionError } =
      await supabase
        .from("work_sessions")
        .select("*")
        .eq("profile_id", profile.id)
        .is("check_out", null)
        .gte("check_in", startOfDay)
        .lte("check_in", endOfDay)
        .maybeSingle();

    if (existingSessionError && existingSessionError.code !== "PGRST116") {
      console.error("Error checking existing session:", existingSessionError);
      return NextResponse.json(
        { error: existingSessionError.message },
        { status: 500 }
      );
    }

    if (existingSession) {
      return NextResponse.json(
        { error: "You already have an active work session" },
        { status: 400 }
      );
    }

    // Create new work session
    const { data: newSession, error: newSessionError } = await supabase
      .from("work_sessions")
      .insert([
        {
          profile_id: profile.id,
          check_in: now.toISOString(),
          check_in_location,
          created_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (newSessionError) {
      console.error("Error creating session:", newSessionError);
      return NextResponse.json(
        { error: newSessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ workSession: newSession });
  } catch (error) {
    console.error("Unexpected error in POST /api/work-sessions:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// PATCH /api/work-sessions - Check Out
export async function PATCH(request) {
  try {
    const supabase = createClient();
    const { check_out_location } = await request.json();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const now = getCurrentTimeInMX();

    // Find the active session for the user
    const { data: activeSession, error: sessionError } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("profile_id", profile.id)
      .is("check_out", null)
      .order("check_in", { ascending: false })
      .limit(1)
      .single();

    if (sessionError) {
      console.error("Error finding active session:", sessionError);
      return NextResponse.json(
        { error: "No active work session found" },
        { status: 404 }
      );
    }

    const checkIn = moment(activeSession.check_in).tz("America/Mexico_City");
    const totalHours = calculateTimeDifference(checkIn, now);

    // Update the session with check out info
    const { data: updatedSession, error: updateError } = await supabase
      .from("work_sessions")
      .update({
        check_out: now.toISOString(),
        check_out_location,
        total_hours: totalHours,
      })
      .eq("id", activeSession.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating session:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ workSession: updatedSession });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/work-sessions:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
