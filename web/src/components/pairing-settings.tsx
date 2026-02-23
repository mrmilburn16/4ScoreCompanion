"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import type { LinkedDeviceResponse, PairingCodeResponse } from "@/types/pairing";

type PairingSettingsProps = {
  notify: (tone: "success" | "warning" | "error", message: string) => void;
};

export function PairingSettings({ notify }: PairingSettingsProps) {
  const [pairingCode, setPairingCode] = useState<PairingCodeResponse | null>(null);
  const [devices, setDevices] = useState<LinkedDeviceResponse[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [busyDeviceId, setBusyDeviceId] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      const response = await fetch("/api/pairing/devices");
      const payload = (await response.json()) as { devices?: LinkedDeviceResponse[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load linked devices.");
      }
      setDevices(payload.devices ?? []);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not load linked devices.");
    } finally {
      setIsLoadingDevices(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const onGenerateCode = useCallback(async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch("/api/pairing/code", { method: "POST" });
      const payload = (await response.json()) as PairingCodeResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not create pairing code.");
      }
      setPairingCode({
        code: payload.code,
        expiresAt: payload.expiresAt,
      });
      notify("success", "Pairing code generated.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not create pairing code.");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [notify]);

  const onCopyCode = useCallback(async () => {
    if (!pairingCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(pairingCode.code);
      notify("success", "Pairing code copied.");
    } catch {
      notify("error", "Could not copy pairing code.");
    }
  }, [notify, pairingCode]);

  const onRevokeDevice = useCallback(
    async (id: string) => {
      setBusyDeviceId(id);
      try {
        const response = await fetch(`/api/pairing/devices/${id}`, { method: "DELETE" });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not revoke linked device.");
        }

        await loadDevices();
        notify("success", "Device revoked.");
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "Could not revoke linked device.");
      } finally {
        setBusyDeviceId(null);
      }
    },
    [loadDevices, notify],
  );

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">
          iOS companion
        </p>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Link an iOS device</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Generate a short-lived pairing code in web, then enter it in the iOS app to connect.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void onGenerateCode()} disabled={isGeneratingCode}>
          {isGeneratingCode ? "Generating…" : "Generate pairing code"}
        </Button>
        <Button variant="ghost" onClick={() => void loadDevices()} disabled={isLoadingDevices}>
          {isLoadingDevices ? "Refreshing…" : "Refresh devices"}
        </Button>
      </div>

      {pairingCode && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/30">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700 dark:text-indigo-300">
            Active pairing code
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-white px-3 py-1.5 text-lg font-black tracking-[0.08em] text-indigo-700 dark:bg-zinc-900 dark:text-indigo-200">
              {pairingCode.code}
            </code>
            <Button size="sm" variant="secondary" onClick={() => void onCopyCode()}>
              Copy
            </Button>
          </div>
          <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
            Expires: {new Date(pairingCode.expiresAt).toLocaleString()}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-300">
          Linked devices
        </h4>
        {devices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-300">
            No linked devices yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{device.name}</p>
                  <div className="flex flex-wrap gap-1">
                    <Pill>{device.tokenPreview}</Pill>
                    <Pill>Linked {new Date(device.createdAt).toLocaleString()}</Pill>
                    <Pill>
                      {device.lastSeenAt
                        ? `Last seen ${new Date(device.lastSeenAt).toLocaleString()}`
                        : "Not used yet"}
                    </Pill>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => void onRevokeDevice(device.id)}
                  disabled={busyDeviceId === device.id}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
