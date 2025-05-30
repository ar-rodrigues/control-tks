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

  try {
    // Parse the request body
    const body = await request.json();

    // Prepare the update data (exclude id and roles if present)
    const updateData = {
      full_name: body.full_name,
      email: body.email,
      profile_picture: body.profile_picture,
      zone: body.zone,
      home_address: body.home_address,
      home_address_coordinates: body.home_address_coordinates,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select(
        "id, full_name, email, profile_picture, zone, roles!profiles_roles_fkey ( role_name ), home_address, home_address_coordinates"
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Request parsing error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
