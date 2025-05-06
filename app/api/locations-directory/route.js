import { getLocationsDirectory, createLocation } from "./locationsDirectory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const locations = await getLocationsDirectory();
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const location = await req.json();
    const newLocation = await createLocation(location);
    return NextResponse.json(newLocation);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
