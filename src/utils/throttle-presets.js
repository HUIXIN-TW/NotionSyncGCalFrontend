import "server-only";
import config from "@/config";
import normalizeEmail from "@/utils/normalize-email";

/**
 * Build register throttling rules per IP.
 */
export function registerIpRules(ip) {
  if (!ip) return [];

  return [
    {
      key: `register:ip:${ip}`,
      minMs: config.REGISTER_IP_MIN_MS,
      window: {
        limit: config.REGISTER_IP_WINDOW_LIMIT,
        ms: config.REGISTER_IP_WINDOW_MS,
      },
      messages: {
        tooFrequent: "Too many requests. Please slow down.",
        windowExceeded: "Too many requests. Please try again later.",
      },
    },
  ];
}

/**
 * Build register throttling rules per email.
 */
export function registerEmailRules(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  return [
    {
      key: `register:email:${normalizedEmail}`,
      minMs: config.REGISTER_EMAIL_MIN_MS,
      window: {
        limit: config.REGISTER_EMAIL_WINDOW_LIMIT,
        ms: config.REGISTER_EMAIL_WINDOW_MS,
      },
      messages: {
        tooFrequent: "Please wait a moment before retrying.",
        windowExceeded:
          "Too many attempts for this email. Please try again later.",
      },
    },
  ];
}

/**
 * Build sync throttling rules: per IP and per user UUID.
 */
export function syncRules(ip, uuid) {
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

  return rules;
}
