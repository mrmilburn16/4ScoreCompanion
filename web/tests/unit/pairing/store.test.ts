import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  authenticateMobileToken,
  createPairingCode,
  exchangePairingCode,
  listLinkedDevices,
  revokeLinkedDevice,
} from "../../../src/lib/pairing/store";

describe("pairing store", () => {
  const tempRoot = path.join(os.tmpdir(), `forscore-pairing-test-${Date.now()}`);

  beforeAll(() => {
    process.env.FILE_STORE_ROOT = tempRoot;
  });

  afterAll(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    delete process.env.FILE_STORE_ROOT;
  });

  it("creates and exchanges pairing codes", async () => {
    const created = await createPairingCode(10);
    expect(created.code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    const exchanged = await exchangePairingCode(created.code, "Mike iPhone");
    expect(exchanged).not.toBeNull();
    expect(exchanged?.token.length).toBeGreaterThan(10);
    expect(exchanged?.device.name).toBe("Mike iPhone");

    const listed = await listLinkedDevices();
    expect(listed.length).toBeGreaterThan(0);
    expect(listed[0]?.name).toBe("Mike iPhone");

    const authed = await authenticateMobileToken(exchanged?.token ?? "");
    expect(authed?.id).toBe(exchanged?.device.id);

    const revoked = await revokeLinkedDevice(exchanged?.device.id ?? "");
    expect(revoked).toBe(true);

    const afterRevoke = await authenticateMobileToken(exchanged?.token ?? "");
    expect(afterRevoke).toBeNull();
  });
});
