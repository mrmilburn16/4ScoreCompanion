import { NextResponse } from "next/server";
import { z } from "zod";

import { exchangePairingCode } from "@/lib/pairing/store";

const exchangeSchema = z.object({
  code: z.string().min(3, "A pairing code is required."),
  deviceName: z.string().trim().min(1, "Device name is required."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = exchangeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const exchanged = await exchangePairingCode(parsed.data.code, parsed.data.deviceName);
    if (!exchanged) {
      return NextResponse.json({ error: "Invalid or expired pairing code." }, { status: 401 });
    }

    return NextResponse.json(exchanged);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not exchange pairing code.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
