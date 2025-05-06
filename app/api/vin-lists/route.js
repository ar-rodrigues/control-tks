import { getVinLists, createVinList } from "./vinLists";
import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import { validateApiKey, getApiKeyFromRequest } from "../../utils/apiKeyAuth";
import { checkBackendPermission } from "../../utils/permissions";

async function validateRequest(request) {
  // First try API key authentication
  const apiKey = getApiKeyFromRequest(request);
  if (apiKey) {
    const isValidApiKey = await validateApiKey(apiKey);
    if (isValidApiKey) {
      return { isValid: true, isAdmin: false };
    }
  }

  // If no valid API key, try admin authentication
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isValid: false, error: "Unauthorized" };
  }

  const hasPermission = await checkBackendPermission(user, ["admin"]);
  if (!hasPermission) {
    return { isValid: false, error: "Forbidden - Insufficient permissions" };
  }

  return { isValid: true, isAdmin: true };
}

export async function GET(request) {
  try {
    const validation = await validateRequest(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const vinLists = await getVinLists();
    return NextResponse.json(vinLists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const validation = await validateRequest(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Only allow admins to create VIN lists
    if (!validation.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can create VIN lists" },
        { status: 403 }
      );
    }

    const vinList = await request.json();
    const newVinList = await createVinList(vinList);
    return NextResponse.json(newVinList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
