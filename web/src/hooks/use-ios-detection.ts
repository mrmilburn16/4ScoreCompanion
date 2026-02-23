"use client";

import { useMemo } from "react";

import { isIOSLikeDevice } from "@/lib/ios/share";

export function useIOSDetection() {
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const isIOS = useMemo(() => isIOSLikeDevice(userAgent), [userAgent]);
  const isTouchDevice = useMemo(
    () => typeof navigator !== "undefined" && navigator.maxTouchPoints > 1,
    [],
  );

  return {
    isIOS,
    isTouchDevice,
  };
}
