import "server-only";
import config from "@config/server/rate-limit";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "@utils/server/db-client";

/**
 * DynamoDB rate limit helpers
 * - PK attribute: defaults to `k` (override with RATE_LIMIT_PK)
 * - TTL attribute: `ttlEpochSec` (epoch seconds). Enable TTL and ttlEpochSec.
 */

const TABLE = process.env.DYNAMODB_RATE_LIMIT_TABLE;
const PK_ATTR = process.env.RATE_LIMIT_PK || "k";

// Key prefixes so different strategies do not collide
const KEY_MIN_PREFIX = "min:";
const KEY_WIN_PREFIX = "win:";

// Helper: was the conditional write rejected by DynamoDB?
const isCondFail = (e) => e?.name === "ConditionalCheckFailedException";

// Helper: epoch seconds now + N days
const ttlSeconds = (days = config.RETAIN_DAYS) =>
  Math.floor(Date.now() / 1000) + days * 86400;

function assertConfigured() {
  if (!TABLE) {
    throw new Error("RATE_LIMIT_TABLE not configured");
  }
}

/**
 * Ensure a minimum spacing between hits for a specific key.
 *
 * @param {string} key  - logical key (e.g. "register:ip:1.2.3.4")
 * @param {number} minMs - required minimum milliseconds between hits
 * @returns {Promise<boolean>} true if allowed, false if throttled
 */
export async function throttleMinIntervalDdb(key, minMs) {
  assertConfigured();
  const now = Date.now();
  const allowedBefore = now - minMs;

  try {
    // lastHit
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { [PK_ATTR]: `${KEY_MIN_PREFIX}${key}` },
        UpdateExpression: "SET lastHit = :now, ttlEpochSec = :ttl",
        ConditionExpression:
          "attribute_not_exists(lastHit) OR lastHit <= :allowedBefore",
        ExpressionAttributeValues: {
          ":now": now,
          ":allowedBefore": allowedBefore,
          ":ttl": ttlSeconds(2),
        },
      }),
    );

    return true;
  } catch (err) {
    if (isCondFail(err)) return false; // too soon
    throw err; // surface real AWS/SDK errors
  }
}

/**
 * Fixed-window limiter.
 *   - Creates/resets the window when missing or expired.
 *   - Otherwise increments within the window while under the limit.
 *
 * @param {string} key  - logical key (e.g. "sync:user:uuid")
 * @param {number} limit - max hits per window
 * @param {number} windowMs - window duration in ms
 * @returns {Promise<boolean>} true if allowed, false if over the limit
 */
export async function rateLimitWindowDdb(key, limit, windowMs) {
  assertConfigured();
  const now = Date.now();
  const expiresAt = now + windowMs;

  // Step 1: reset when missing/expired
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { [PK_ATTR]: `${KEY_WIN_PREFIX}${key}` },
        UpdateExpression:
          "SET windowCount = :one, windowExpiresAt = :exp, ttlEpochSec = :ttl",
        ConditionExpression:
          "attribute_not_exists(windowExpiresAt) OR windowExpiresAt <= :now",
        ExpressionAttributeValues: {
          ":one": 1,
          ":exp": expiresAt,
          ":now": now,
          ":ttl": ttlSeconds(2),
        },
      }),
    );
    return true;
  } catch (err) {
    if (!isCondFail(err)) throw err; // unexpected error
    // else: window exists and has not expired; fall through to increment
  }

  // Step 2: increment if under limit inside active window
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { [PK_ATTR]: `${KEY_WIN_PREFIX}${key}` },
        UpdateExpression:
          "SET windowCount = windowCount + :inc, ttlEpochSec = :ttl",
        ConditionExpression: "windowExpiresAt > :now AND windowCount < :limit",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":limit": limit,
          ":now": now,
          ":ttl": ttlSeconds(2),
        },
      }),
    );
    return true;
  } catch (err) {
    if (isCondFail(err)) return false; // limit exceeded
    throw err;
  }
}

export function isDdbRateLimitEnabled() {
  return Boolean(TABLE);
}
