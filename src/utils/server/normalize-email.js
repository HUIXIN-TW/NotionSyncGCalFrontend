import "server-only";

/**
 * Normalize email addresses for consistent comparisons.
 * Trims whitespace, applies NFC unicode normalization, and lowercases.
 * Returns null when the input is not a non-empty string.
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return null;

  const trimmed = email.trim();
  if (!trimmed) return null;

  let normalized = trimmed;
  try {
    normalized = normalized.normalize("NFC");
  } catch {
    // Ignore unicode normalization failures and fall back to trimmed value.
  }

  return normalized.toLowerCase();
}

export default normalizeEmail;
