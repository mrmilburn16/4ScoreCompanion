import { randomBytes, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  LinkedDeviceRecord,
  LinkedDeviceResponse,
  PairingCodeRecord,
  PairingCodeResponse,
} from "@/types/pairing";

type PairingCodeIndex = {
  codes: PairingCodeRecord[];
};

type LinkedDeviceIndex = {
  devices: LinkedDeviceRecord[];
};

const EMPTY_CODES: PairingCodeIndex = { codes: [] };
const EMPTY_DEVICES: LinkedDeviceIndex = { devices: [] };

function getStoreRoot() {
  return process.env.FILE_STORE_ROOT
    ? path.resolve(process.env.FILE_STORE_ROOT)
    : path.join(process.cwd(), "data");
}

function getPairingCodePath() {
  return path.join(getStoreRoot(), "pairing-codes.json");
}

function getDevicePath() {
  return path.join(getStoreRoot(), "linked-devices.json");
}

async function ensurePairingStorage() {
  await fs.mkdir(getStoreRoot(), { recursive: true });
}

async function readCodeIndex(): Promise<PairingCodeIndex> {
  try {
    const raw = await fs.readFile(getPairingCodePath(), "utf8");
    const parsed = JSON.parse(raw) as PairingCodeIndex;
    return Array.isArray(parsed.codes) ? parsed : EMPTY_CODES;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_CODES;
    }
    throw error;
  }
}

async function writeCodeIndex(index: PairingCodeIndex) {
  await ensurePairingStorage();
  await fs.writeFile(getPairingCodePath(), JSON.stringify(index, null, 2), "utf8");
}

async function readDeviceIndex(): Promise<LinkedDeviceIndex> {
  try {
    const raw = await fs.readFile(getDevicePath(), "utf8");
    const parsed = JSON.parse(raw) as LinkedDeviceIndex;
    return Array.isArray(parsed.devices) ? parsed : EMPTY_DEVICES;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DEVICES;
    }
    throw error;
  }
}

async function writeDeviceIndex(index: LinkedDeviceIndex) {
  await ensurePairingStorage();
  await fs.writeFile(getDevicePath(), JSON.stringify(index, null, 2), "utf8");
}

function buildShortCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let index = 0; index < 8; index += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${output.slice(0, 4)}-${output.slice(4)}`;
}

export async function createPairingCode(ttlMinutes = 10): Promise<PairingCodeResponse> {
  const now = Date.now();
  const expiresAt = new Date(now + ttlMinutes * 60_000).toISOString();
  const code = buildShortCode();
  const index = await readCodeIndex();

  index.codes = index.codes.filter((item) => {
    const isExpired = new Date(item.expiresAt).getTime() <= now;
    return !isExpired && item.usedAt === null;
  });

  index.codes.push({
    id: randomUUID(),
    code,
    createdAt: new Date(now).toISOString(),
    expiresAt,
    usedAt: null,
    usedByDeviceId: null,
  });

  await writeCodeIndex(index);
  return { code, expiresAt };
}

function tokenPreview(token: string) {
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function mapDeviceToResponse(device: LinkedDeviceRecord): LinkedDeviceResponse {
  return {
    id: device.id,
    name: device.name,
    createdAt: device.createdAt,
    lastSeenAt: device.lastSeenAt,
    tokenPreview: tokenPreview(device.token),
  };
}

export async function exchangePairingCode(inputCode: string, deviceName: string) {
  const normalized = inputCode.trim().toUpperCase();
  const now = Date.now();
  const codeIndex = await readCodeIndex();

  const targetCode = codeIndex.codes.find((item) => {
    if (item.usedAt !== null) {
      return false;
    }
    if (new Date(item.expiresAt).getTime() <= now) {
      return false;
    }
    return item.code.toUpperCase() === normalized;
  });

  if (!targetCode) {
    return null;
  }

  const token = randomBytes(24).toString("hex");
  const device: LinkedDeviceRecord = {
    id: randomUUID(),
    name: deviceName.trim() || "iOS Device",
    token,
    createdAt: new Date().toISOString(),
    lastSeenAt: null,
  };

  const deviceIndex = await readDeviceIndex();
  deviceIndex.devices.push(device);
  await writeDeviceIndex(deviceIndex);

  targetCode.usedAt = new Date().toISOString();
  targetCode.usedByDeviceId = device.id;
  await writeCodeIndex(codeIndex);

  return {
    token,
    device: mapDeviceToResponse(device),
  };
}

export async function listLinkedDevices(): Promise<LinkedDeviceResponse[]> {
  const index = await readDeviceIndex();
  return [...index.devices]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map(mapDeviceToResponse);
}

export async function revokeLinkedDevice(id: string): Promise<boolean> {
  const index = await readDeviceIndex();
  const before = index.devices.length;
  index.devices = index.devices.filter((device) => device.id !== id);
  if (index.devices.length === before) {
    return false;
  }
  await writeDeviceIndex(index);
  return true;
}

export async function authenticateMobileToken(token: string): Promise<LinkedDeviceResponse | null> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return null;
  }

  const index = await readDeviceIndex();
  const target = index.devices.find((device) => device.token === cleanToken);
  if (!target) {
    return null;
  }

  target.lastSeenAt = new Date().toISOString();
  await writeDeviceIndex(index);
  return mapDeviceToResponse(target);
}
