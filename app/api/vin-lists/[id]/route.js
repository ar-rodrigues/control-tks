import { updateVinList, deleteVinList, getVinListById } from "../vinLists";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const vinList = await req.json();
    const updatedVinList = await updateVinList(id, vinList);
    return NextResponse.json(updatedVinList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const result = await deleteVinList(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const vinList = await getVinListById(id);
    return NextResponse.json(vinList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
