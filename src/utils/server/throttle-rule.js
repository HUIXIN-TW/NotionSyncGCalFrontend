import "server-only";
import config from "@config/server/rate-limit";


/**
 * Build sync throttling rules: per IP and per user UUID.
 */
export function syncRules(ip, uuid, providerSub) {
  const rules = [];

  if (ip) {
    rules.push({
      key: `sync:ip:${ip}`,
      minMs: config.SYNC_IP_MIN_MS,
      window: {
        limit: config.SYNC_IP_WINDOW_LIMIT,
        ms: config.SYNC_IP_WINDOW_MS,
      },
      messages: {
        tooFrequent: "Too many requests. Please slow down.",
        windowExceeded: "Too many requests. Please try again later.",
      },
    });
  }

  if (uuid) {
    rules.push({
      key: `sync:user:${uuid}`,
      minMs: config.SYNC_USER_MIN_MS,
      window: {
        limit: config.SYNC_USER_WINDOW_LIMIT,
        ms: config.SYNC_USER_WINDOW_MS,
      },
      messages: {
        tooFrequent: "Please wait a moment before retrying.",
        windowExceeded: "Too many syncs in a short period.",
      },
    });
  }

  if (providerSub) {
    rules.push({
      key: `sync:providerSub:${providerSub}`,
      minMs: config.SYNC_USER_MIN_MS,
      window: {
        limit: config.SYNC_USER_WINDOW_LIMIT,
        ms: config.SYNC_USER_WINDOW_MS,
      },
      messages: {
        tooFrequent: "Please wait a moment before retrying.",
        windowExceeded: "Too many syncs in a short period.",
      },
    });
  }

  return rules;
}

