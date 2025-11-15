import "server-only";
import logger, { isProdRuntime as isProd } from "@utils/shared/logger";
import {
  isDdbRateLimitEnabled,
  throttleMinIntervalDdb,
  rateLimitWindowDdb,
} from "@models/rate-limit";

let hasWarnedMissingRateLimit = false;

/**
 * Extracts the client IP from a Next.js Request
 */
export function extractClientIp(req) {
  try {
    // x-forwarded-for
    const forwarded = req?.headers
      ?.get?.("x-forwarded-for")
      ?.split(",")
      .map((ip) => ip.trim())
      .find(Boolean);
    if (forwarded) return forwarded;

    // x-real-ip used by some proxies
    const realIp = req?.headers?.get?.("x-real-ip");
    if (realIp) return realIp;
  } catch (e) {
    logger.warn("Failed to extract client IP", e);
  }

  return null;
}

/**
 * Enforce an array of throttling rules.
 * Returns null if allowed; otherwise an object { status, body } suitable for a Response.
 */
export async function enforceDDBThrottle(rules = []) {
  // skip if non-production
  if (!isProd) {
    logger.info("Skipping throttle enforcement in non-production runtime");
    return null;
  }
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

  return null; // allowed
}
