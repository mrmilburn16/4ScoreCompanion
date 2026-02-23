import { NextResponse } from "next/server";

import { createPairingCode } from "@/lib/pairing/store";

export async function POST() {
  try {
    const created = await createPairingCode(10);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not generate pairing code.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
