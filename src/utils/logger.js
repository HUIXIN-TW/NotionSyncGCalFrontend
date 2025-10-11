// Centralized logging utility
// - In production, suppress debug logs and optionally sensitive logs
// - In non-production, print helpful messages for debugging

const ENV = process.env.NODE_ENV || "development";
const isProd = ENV === "production";

// Basic mask helpers to avoid printing full secrets
export function maskValue(value, visible = 4) {
  if (!value || typeof value !== "string") return value;
  if (value.length <= visible) return "*".repeat(value.length);
  return `${value.slice(0, visible)}${"*".repeat(Math.max(4, value.length - visible))}`;
}

const base = {
  debug: (...args) => {
    if (!isProd) console.debug("[DEBUG]", ...args);
  },
  info: (...args) => {
    if (!isProd) console.info("[INFO]", ...args);
  },
  warn: (...args) => {
    // Warnings can be useful in production but keep them minimal
    if (!isProd) console.warn("[WARN]", ...args);
  },
  error: (...args) => {
    // In production, only log concise error messages without sensitive data
    if (isProd) {
      const safe = args.map((a) => (a instanceof Error ? a.message : a));
      console.error("[ERROR]", ...safe);
    } else {
      console.error("[ERROR]", ...args);
    }
  },
  sensitive: (...args) => {
    // Never print sensitive payloads in production
    if (!isProd) console.log("[SENSITIVE]", ...args);
  },
};

export default base;
