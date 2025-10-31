"use client";

import React, { useState } from "react";
import Button from "@components/button/Button";
import config from "@/config/rate-limit";
import { useCountdown } from "@/hooks/useCountdown";
import logger from "@/utils/shared/logger";
import validateConfigFormat from "@/utils/client/validate-config-format";

export default function SaveButton({
  editableConfig,
  setEditMode,
  setLastFetchedAt,
  setShowFetchButton,
}) {
  const [loading, setLoading] = useState(false);
  const UPLOAD_LIMIT_MS = config.UPLOAD_MIN_MS ?? 3 * 60_000;
  const { startCountdown, isCountingDown, formattedRemaining } =
    useCountdown("cooldown:save");

  const toLegacyArrayOfOne = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object" && Object.keys(v).length > 0) return [v];
    return [{}];
  };

  const serializeForBackend = (cfg) => {
    // Convert gcal_dic and page_property back to legacy array-of-one format
    const out = { ...cfg };
    if ("gcal_dic" in out) out.gcal_dic = toLegacyArrayOfOne(out.gcal_dic);
    if ("page_property" in out)
      out.page_property = toLegacyArrayOfOne(out.page_property);
    return out;
  };

  const stripSensitiveForLocal = (cfg) => {
    const { notion_token, ...rest } = cfg; // avoid storing token client-side
    return rest;
  };

  const handleSaveClick = async () => {
    if (loading || isCountingDown) return;

    setLoading(true);

    // 1) Build the payload you will POST
    const payload = serializeForBackend(editableConfig);
    logger.info("Payload to save:", payload);

    // 2) Validate WITHOUT mutation
    const errors = validateConfigFormat(payload);
    logger.debug("Validation result:", errors);

    if (errors.length > 0) {
      alert("Validation failed:\n\n" + errors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Saved successfully!");
        setEditMode(false);

        // 3) Persist exactly what you POSTED (for consistent reloads)
        const nowIso = new Date().toISOString();
        const safeToStore = stripSensitiveForLocal(payload);
        localStorage.setItem("notionConfig", JSON.stringify(safeToStore));
        localStorage.setItem("notionConfigFetchedAt", nowIso);
        setLastFetchedAt(new Date(nowIso).toLocaleString());

        startCountdown(UPLOAD_LIMIT_MS);
      } else {
        setShowFetchButton(true);
        const { message } = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        alert("Save failed: " + message);
      }
    } catch (err) {
      logger.error("Save failed:", err);
      alert("Unexpected network error during save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      text={
        loading
          ? "Saving..."
          : isCountingDown
            ? `Please wait ${formattedRemaining} to save`
            : "Save"
      }
      onClick={handleSaveClick}
      disabled={loading || isCountingDown}
    />
  );
}
