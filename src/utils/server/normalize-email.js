import "server-only";
import crypto from "crypto";

/**
 * Normalize email for consistent comparison.
 * - trims
 * - Unicode NFC
 * - lowercases
 * - rejects empty or >320 chars
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return null;

  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 320) return null;

  let normalized = trimmed;
  try {
    normalized = normalized.normalize("NFC");
  } catch {
    // Ignore unicode normalization failures and fall back to trimmed value.
  }

  return normalized.toLowerCase();
}

/**
 * Canonicalize email for identity matching or dedup.
 * - calls normalizeEmail
 * - Gmail: drop "+alias" and dots in local-part
 * - non-Gmail: return normalized as-is
 * - malformed (no "@"): returns normalized
 */
export function canonicalizeEmail(raw) {
  const normalized = normalizeEmail(raw);
  if (!normalized) return null;

  const atIdx = normalized.indexOf("@");
  if (atIdx < 0) return normalized;

  let local = normalized.slice(0, atIdx);
  const domain = normalized.slice(atIdx + 1);

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plusIdx = local.indexOf("+");
    if (plusIdx !== -1) local = local.slice(0, plusIdx);
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

/**
 * Hash canonicalized email using MD5.
 * Returns a 32-character lowercase hex string.
 */
export function hashCanonicalizedEmail(raw) {
  const canonical = canonicalizeEmail(raw);
  if (!canonical) return null;

  // trim again for safety, e.g. stray whitespace before hashing
  const clean = canonical.trim();
  return crypto.createHash("md5").update(clean, "utf8").digest("hex");
}

export default {
  normalizeEmail,
  canonicalizeEmail,
  hashCanonicalizedEmail,
};
