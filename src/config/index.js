// Centralized configuration (non-env). Adjust values here as needed.

const config = {
  // Retain Days
  RETAIN_DAYS: 2,

  // Sync API throttling
  SYNC_IP_WINDOW_LIMIT: 60, // per IP, per hour
  SYNC_IP_WINDOW_MS: 60 * 60_000,
  SYNC_IP_MIN_MS: 3000, // spacing for bursts

  SYNC_USER_MIN_MS: 60 * 60_000, // per user UUID: 1/hour
  SYNC_USER_WINDOW_LIMIT: 1, // per user
  SYNC_USER_WINDOW_MS: 60 * 60_000,

  // Register API throttling
  REGISTER_IP_MIN_MS: 3000,
  REGISTER_IP_WINDOW_LIMIT: 5,
  REGISTER_IP_WINDOW_MS: 60_000,

  REGISTER_EMAIL_MIN_MS: 5000,
  REGISTER_EMAIL_WINDOW_LIMIT: 3,
  REGISTER_EMAIL_WINDOW_MS: 5 * 60_000,

  // S3 Upload throttling
  UPLOAD_MIN_MS: 30 * 60_000, // per user UUID: 30 minutes
};

export default config;
