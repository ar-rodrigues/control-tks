import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

/**
 * ///
 * /////// GET /api/users/auditors
 */

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, profile_picture, zone, roles!profiles_roles_fkey ( role_name ), home_address, home_address_coordinates"
    )
    .eq("roles.role_name", "auditor")
    .not("roles", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
