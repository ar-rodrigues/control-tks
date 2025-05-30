import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from("planning")
      .select(
        `
        *,
        location:location_id (
          id,
          cliente,
          convenio,
          zona,
          es_matriz
        ),
        auditor:auditor_id (
          id,
          full_name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Planning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from("planning")
      .update(body)
      .eq("id", id)
      .select(
        `
        *,
        location:location_id (
          id,
          cliente,
          convenio,
          zona,
          es_matriz
        ),
        auditor:auditor_id (
          id,
          full_name
        )
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Planning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from("planning")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Planning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
