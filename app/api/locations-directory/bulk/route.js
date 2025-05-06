import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { locations } = await request.json();

    if (!Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron ubicaciones válidas" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      "cliente",
      "convenio",
      "agencia",
      "direccion",
      "ciudad",
      "estado",
      "cp",
    ];
    const invalidLocations = locations.filter(
      (loc) => !requiredFields.every((field) => loc[field])
    );

    if (invalidLocations.length > 0) {
      return NextResponse.json(
        { error: "Algunas ubicaciones no tienen todos los campos requeridos" },
        { status: 400 }
      );
    }

    // Insert all locations
    const { data, error } = await supabase
      .from("locations_directory")
      .insert(locations)
      .select();

    if (error) {
      console.error("Error inserting locations:", error);
      return NextResponse.json(
        { error: "Error al insertar las ubicaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${locations.length} ubicaciones importadas correctamente`,
      data,
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
