"use client";

import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";

export function getPollingTimings() {
  return {
    initialWaitMs: isProd ? 30_000 : 2_000,
    intervalMs: isProd ? 15_000 : 2_000,
    maxTotalMs: isProd ? 600_000 : 60_000,
    skewMs: 3_000,
  };
}

export async function fetchUser() {
  try {
    const res = await fetch(`/api/user/me`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok)
      throw new Error(data?.message || `Failed to fetch user (${res.status})`);
    logger.debug("fetch-user-success");
    return data;
  } catch (e) {
    logger.error("fetch-user-error", e);
    return null;
  }
}

export async function pollLastSyncLog({ triggerTimeMs }) {
  const { initialWaitMs, intervalMs, maxTotalMs, skewMs } = getPollingTimings();
  const started = Date.now();
  const deadline = started + maxTotalMs;

  logger.debug("poll-start", {
    started,
    deadline,
    initialWaitMs,
    intervalMs,
    maxTotalMs,
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // first read
  let currentUser = await fetchUser();

  // initial wait before polling
  await sleep(initialWaitMs);

  while (Date.now() < deadline) {
    currentUser = await fetchUser();
    if (!currentUser) {
      await sleep(intervalMs);
      continue;
    }
    const currentLastSyncLog = currentUser.lastSyncLog ?? null;
    const updatedAtMs = Number(currentUser.updatedAtMs);
    const hasValidTime = Number.isFinite(updatedAtMs);

    logger.debug("poll-iter", {
      hasUser: !!currentUser,
      updatedAtMs: hasValidTime ? updatedAtMs : null,
      triggerTimeMs: typeof triggerTimeMs === "number" ? triggerTimeMs : null,
    });

    if (
      typeof triggerTimeMs === "number" &&
      hasValidTime &&
      updatedAtMs >= triggerTimeMs - skewMs
    ) {
      const result = parseAndVerifyLastSyncLog(currentLastSyncLog);
      logger.info("poll-done-trigger", { result });
      return { type: result.status, message: result.message };
    }

    await sleep(intervalMs);
  }

  return {
    type: "timeout",
    message:
      "Polling window exceeded. No post-trigger update detected within time limit.",
    lastSyncLog: currentUser?.lastSyncLog ?? null,
    updatedAt: currentUser?.updatedAt ?? null, // YYYY-MM-DD
    updatedAtMs: currentUser?.updatedAtMs ?? null, // epoch ms
  };
}

/**
 * Safely parse and normalize lastSyncLog into a consistent object
 * Handles: stringified JSON, plain strings, arrays, or objects
 * Always returns { status?: string, message?: string, raw: any }
 */
export function parseAndVerifyLastSyncLog(input) {
  if (input == null) {
    return { status: "unknown", message: "No log provided", raw: null };
  }

  let parsed = input;

  try {
    // handle JSON string
    if (typeof input === "string") {
      parsed = JSON.parse(input);
    } else if (Array.isArray(input)) {
      // take last element of array
      parsed = input[input.length - 1];
    }
  } catch {
    // not valid JSON → fallback to string
    parsed = { message: String(input) };
  }

  // if still a string after fallback
  if (typeof parsed === "string") {
    parsed = { message: parsed };
  }

  // extract normalized fields
  const status = parsed?.status || parsed?.state || parsed?.level || "unknown";

  const message =
    parsed?.message ||
    parsed?.msg ||
    parsed?.detail ||
    parsed?.error?.message ||
    parsed?.error ||
    parsed?.statusText ||
    String(input);

  return {
    status,
    message,
    raw: parsed,
  };
}
