"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import logger from "@utils/shared/logger";

export function useNotionConfig() {
  const { data: session, status } = useSession();

  const [editableConfig, setEditableConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConfig = useCallback(async () => {
    if (!session?.user) {
      logger.warn("[useNotionConfig] no session user; skip loading");
      setError("Not authenticated");
      return;
    }

    try {
      if (loading) return;
      setLoading(true);
      setError(null);

      const res = await fetch("/api/notion/service/config", { method: "GET" });

      if (!res.ok) {
        logger.error("[useNotionConfig] fetch failed", res.statusText);
        setError(`Failed to load config (${res.status})`);
        return;
      }

      const data = await res.json();

      logger.info("[useNotionConfig] fetched config", data.config);
      setEditableConfig(data.config);
      try {
        localStorage.setItem("notionConfig", JSON.stringify(data.config));
      } catch (e) {
        logger.warn(
          "[useNotionConfig] failed to cache config to localStorage",
          e,
        );
      }
    } catch (err) {
      logger.error("[useNotionConfig] unexpected error", err);
      setError("Unexpected error occurred");
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status !== "authenticated") return;

    try {
      const cached = localStorage.getItem("notionConfig");
      if (cached) {
        const parsed = JSON.parse(cached);
        setEditableConfig(parsed);
      }
    } catch (e) {
      logger.warn("[useNotionConfig] failed to read cache", e);
    }

    loadConfig();
  }, [status, loadConfig]);

  return {
    editableConfig,
    setEditableConfig,
    loading,
    error,
    reload: loadConfig,
  };
}
