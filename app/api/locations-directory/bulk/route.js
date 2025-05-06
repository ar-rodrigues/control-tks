import { bulkInsertLocations } from "../locationsDirectory";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { locations } = await request.json();
    const data = await bulkInsertLocations(locations);
    return NextResponse.json({
      message: `${locations.length} ubicaciones importadas correctamente`,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
