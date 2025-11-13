"use client";

import { useCallback, useEffect, useState } from "react";
import logger from "@utils/shared/logger";

export default function useSyncHandler({
  userUuid,
  cooldownMs = 0,
  startCountdown,
} = {}) {
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStartedAt, setSyncStartedAt] = useState(null);

  // Restore last sync result for the user
  useEffect(() => {
    if (typeof window === "undefined" || !userUuid) return;
    const key = `syncResult:${userUuid}`;
    try {
      const latestSyncResult = localStorage.getItem(key);
      setSyncResult(latestSyncResult ? JSON.parse(latestSyncResult) : null);
    } catch (err) {
      logger.warn("Failed to restore syncResult", err);
    }
  }, [userUuid]);

  // Persist sync result whenever it changes
  useEffect(() => {
    if (typeof window === "undefined" || !userUuid || !syncResult) return;
    const key = `syncResult:${userUuid}`;
    try {
      localStorage.setItem(key, JSON.stringify(syncResult));
    } catch (err) {
      logger.warn("Failed to persist syncResult", err);
    }
  }, [syncResult, userUuid]);

  // use Callback to memoize handleSync function
  // Make sure hook return to same reference unless dependencies change
  const handleSync = useCallback(
    async (syncPromise) => {
      setIsSyncing(true);
      setSyncStartedAt(Date.now());

      try {
        const result = await syncPromise;
        setSyncResult(result);
        if (typeof startCountdown === "function" && cooldownMs > 0) {
          startCountdown(cooldownMs);
        }
      } catch (err) {
        logger.error("Unexpected sync failure", err);
        setSyncResult({
          type: "error",
          message: "Unexpected sync failure.",
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [cooldownMs, startCountdown],
  );

  return {
    syncResult,
    isSyncing,
    syncStartedAt,
    handleSync,
  };
}
