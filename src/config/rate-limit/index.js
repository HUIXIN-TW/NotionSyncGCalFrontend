// Centralized configuration (non-env). Adjust values here as needed.

const config = {
  // Retain Days
  RETAIN_DAYS: 2,

  // Sync API throttling
  // IP-based limits
  SYNC_IP_WINDOW_LIMIT: 60, // Limit per IP address: allow 60 sync requests per hour
  SYNC_IP_WINDOW_MS: 60 * 60_000, // Measurement window for IP limit (1 hour)
  SYNC_IP_MIN_MS: 3000, // Minimum spacing between consecutive syncs from same IP (3 seconds)

  // User-based limits
  SYNC_USER_WINDOW_LIMIT: 1, // Limit per user UUID: allow 1 sync every 10 minutes
  SYNC_USER_WINDOW_MS: 10 * 60_000, // Time window for user-based limit (10 minutes)
  SYNC_USER_MIN_MS: 10 * 60_000, // Minimum spacing between bursts for the same user (10 minutes)

  // Register API throttling
  // IP-based limits
  REGISTER_IP_WINDOW_LIMIT: 5, // Limit per IP: 5 registration attempts per minute
  REGISTER_IP_WINDOW_MS: 60_000, // Time window for IP-based registration limit (1 minute)
  REGISTER_IP_MIN_MS: 3000, // Minimum delay between registration requests from same IP (3 seconds)

  // Email-based limits
  REGISTER_EMAIL_WINDOW_LIMIT: 3, // Limit per email address: 3 registration attempts per 5 minutes
  REGISTER_EMAIL_WINDOW_MS: 5 * 60_000, // Time window for email-based limit (5 minutes)
  REGISTER_EMAIL_MIN_MS: 5000, // Minimum delay between registration requests using the same email (5 seconds)

  // S3 Upload throttling
  UPLOAD_MIN_MS: 3 * 60_000, // per user UUID: 3 minutes

  // S3 Test Connection throttling
  TEST_CONNECTION_USER_WINDOW_LIMIT: 5, // Limit per user UUID: 5 connection tests per 10 minutes
  TEST_CONNECTION_USER_WINDOW_MS: 10 * 60_000, // Time window for test connection limit (10 minutes)
  TEST_CONNECTION_USER_MIN_MS: 60_000, // Minimum spacing between connection tests for the same user (1 minute)
};

export default Object.freeze(config);
