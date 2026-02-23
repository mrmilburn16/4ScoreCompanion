import { NextResponse } from "next/server";

import { revokeLinkedDevice } from "@/lib/pairing/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const revoked = await revokeLinkedDevice(id);
  if (!revoked) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
