import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET(request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  try {
    let query = supabase.from("planning").select(`
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
      `);

    // Add date range filter if provided
    if (start_date && end_date) {
      query = query.gte("audit_date", start_date).lte("audit_date", end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return empty array if no data found
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const supabase = createClient();
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from("planning")
      .insert(body)
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
