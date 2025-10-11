import "server-only";
import logger from "@/utils/logger";
import {
  isDdbRateLimitEnabled,
  throttleMinIntervalDdb,
  rateLimitWindowDdb,
} from "@/models/rate-limit";

let hasWarnedMissingRateLimit = false;


/**
 * Enforce an array of throttling rules.
 * Returns null if allowed; otherwise an object { status, body } suitable for a Response.
 */
export async function enforceThrottle(rules = []) {
  if (!isDdbRateLimitEnabled()) {
    if (!hasWarnedMissingRateLimit) {
      logger.warn(
        "RATE_LIMIT_TABLE not configured; skipping throttle enforcement",
      );
      hasWarnedMissingRateLimit = true;
    }
    return null;
  }

  for (const rule of rules) {
    const { key, minMs, window, messages } = rule || {};
    if (!key) continue;

    // Minimum-interval gate
    if (typeof minMs === "number" && minMs > 0) {
      const ok = await throttleMinIntervalDdb(key, minMs);
      if (!ok) {
        return {
          status: 429,
          body: {
            error:
              messages?.tooFrequent || "Too many requests. Please slow down.",
          },
        };
      }
    }

    // Fixed-window gate
    if (window?.limit && window?.ms) {
      const ok = await rateLimitWindowDdb(key, window.limit, window.ms);
      if (!ok) {
        return {
          status: 429,
          body: {
            error:
              messages?.windowExceeded ||
              "Too many requests. Please try again later.",
          },
        };
      }
    }
  }

  return null;
}
