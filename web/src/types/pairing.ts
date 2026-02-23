export type PairingCodeRecord = {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  usedByDeviceId: string | null;
};

export type LinkedDeviceRecord = {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  lastSeenAt: string | null;
};

export type PairingCodeResponse = {
  code: string;
  expiresAt: string;
};

export type LinkedDeviceResponse = {
  id: string;
  name: string;
  createdAt: string;
  lastSeenAt: string | null;
  tokenPreview: string;
};
