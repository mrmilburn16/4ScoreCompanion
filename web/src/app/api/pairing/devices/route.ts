import { NextResponse } from "next/server";

import { listLinkedDevices } from "@/lib/pairing/store";

export async function GET() {
  try {
    const devices = await listLinkedDevices();
    return NextResponse.json({ devices });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not list linked devices.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
