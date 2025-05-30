import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

/**
 * ///
 * /////// GET /api/users/auditors/[id]
 */

export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, profile_picture, zone, roles!profiles_roles_fkey ( role_name ), home_address, home_address_coordinates"
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * ///
 * /////// PUT /api/users/auditors/[id]
 */

export async function PUT(request, { params }) {
  const supabase = createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("profiles")
    .update(request.body)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
