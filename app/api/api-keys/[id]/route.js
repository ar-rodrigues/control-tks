import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { checkBackendPermission } from "../../../utils/permissions";
import { updateApiKey, deleteApiKey, getApiKeyById } from "../apiKeys";

// PATCH /api/api-keys/[id] - Update an API key (admin only)
export async function PATCH(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

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
    const updates = await request.json();

    const updatedKey = await updateApiKey(id, updates);
    return NextResponse.json(updatedKey);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/api-keys/[id] - Delete an API key (admin only)
export async function DELETE(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

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

    await deleteApiKey(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/api-keys/[id] - Get a single API key (admin only)
export async function GET(request, { params }) {
  try {
    const supabase = createClient();
    const { id } = params;

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

    const apiKey = await getApiKeyById(id);
    return NextResponse.json(apiKey);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
