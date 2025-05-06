import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import { checkBackendPermission } from "../../utils/permissions";
import { getApiKeys, createApiKey } from "./apiKeys";

// GET /api/api-keys - Get all API keys (admin only)
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

    // Check if user is admin
    const hasPermission = await checkBackendPermission(user, ["admin"]);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const apiKeys = await getApiKeys();
    return NextResponse.json(apiKeys);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/api-keys - Create a new API key (admin only)
export async function POST(request) {
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

    // Check if user is admin
    const hasPermission = await checkBackendPermission(user, ["admin"]);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get request body
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newApiKey = await createApiKey(name, user.id);
    return NextResponse.json(newApiKey);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
