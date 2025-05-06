import { getVinLists, createVinList } from "./vinLists";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vinLists = await getVinLists();
    return NextResponse.json(vinLists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const vinList = await req.json();
    const newVinList = await createVinList(vinList);
    return NextResponse.json(newVinList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
