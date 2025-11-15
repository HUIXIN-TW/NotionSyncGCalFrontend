// Centralized configuration (non-env). Adjust values here as needed.

const config = {
  // Retain Days
  RETAIN_DAYS: 2,

  // Sync API throttling
  // IP-based limits
  SYNC_IP_WINDOW_LIMIT: 60, // Limit per IP address: allow 60 syncs every hour
  SYNC_IP_WINDOW_MS: 60 * 60_000, // Measurement window for IP limit (1 hour)
  SYNC_IP_MIN_MS: 3000, // Minimum spacing between consecutive syncs from same IP (3 seconds)

  // User-based limits
  SYNC_USER_WINDOW_LIMIT: 1, // Limit per user UUID: allow 1 sync every 3 minutes
  SYNC_USER_WINDOW_MS: 3 * 60_000, // Time window for user-based limit (3 minutes)
  SYNC_USER_MIN_MS: 3 * 60_000, // Minimum spacing between bursts for the same user (3 minutes)

  // global defaults
  GLOBAL_IP_WINDOW_LIMIT: 100, // Limit per IP address: allow 100 requests per minute
  GLOBAL_IP_WINDOW_MS: 3 * 60_000, // Measurement window for IP limit (3 minutes)
  GLOBAL_IP_MIN_MS: 300, // Minimum spacing between consecutive requests from same IP (300 ms)

  GLOBAL_USER_WINDOW_LIMIT: 50, // Limit per user UUID: allow 50 requests per minute
  GLOBAL_USER_WINDOW_MS: 60_000, // Measurement window for user limit (1 minute)
  GLOBAL_USER_MIN_MS: 300, // Minimum spacing between consecutive requests from same user (300 ms)
};

export default Object.freeze(config);
