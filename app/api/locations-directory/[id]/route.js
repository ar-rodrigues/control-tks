import {
  updateLocation,
  deleteLocation,
  getLocationById,
} from "../locationsDirectory";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const location = await req.json();
    const updatedLocation = await updateLocation(id, location);
    return NextResponse.json(updatedLocation);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const result = await deleteLocation(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const location = await getLocationById(id);
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
