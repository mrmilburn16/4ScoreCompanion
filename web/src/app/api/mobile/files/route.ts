import { NextResponse } from "next/server";

import { authenticateMobileToken } from "@/lib/pairing/store";
import { listStoredFiles } from "@/lib/storage/file-store";

function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7);
  }

  const tokenHeader = request.headers.get("x-companion-token");
  if (tokenHeader) {
    return tokenHeader;
  }

  return "";
}

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  const authenticatedDevice = await authenticateMobileToken(token);
  if (!authenticatedDevice) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const files = await listStoredFiles();
  return NextResponse.json({
    device: authenticatedDevice,
    files,
  });
}
