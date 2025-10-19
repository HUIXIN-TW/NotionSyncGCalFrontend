import "server-only";
import logger from "@/utils/logger";
import { getConfigLastModified } from "@/utils/server/s3-client";
import {
  isDdbRateLimitEnabled,
  throttleMinIntervalDdb,
  rateLimitWindowDdb,
} from "@/models/rate-limit";
import config from "@/config";

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

export async function enforceS3Throttle(user) {
  const id = user.uuid;
  if (!id) return null;
  const THROTTLE_UPLOAD_MIN_MS = config.UPLOAD_MIN_MS; // 30 minutes default
  const lastModified = await getConfigLastModified(id);
  if (!lastModified) {
    logger.info("No previous config timestamp — skipping throttle check.");
    return null;
  }

  const timeGap = Date.now() - new Date(lastModified).getTime();
  if (timeGap < THROTTLE_UPLOAD_MIN_MS) {
    const waitMinutes = Math.ceil(
      (THROTTLE_UPLOAD_MIN_MS - timeGap) / (1000 * 60),
    );
    logger.info(`[UPLOAD BLOCKED] User: ${id}, Time Gap: ${timeGap}ms`);
    return {
      status: 429,
      body: {
        type: "throttle error",
        message: `Too frequent update. Please wait ~${waitMinutes} minute(s).`,
      },
    };
  }
  return null;
}
