import "server-only";
import logger from "@/utils/shared/logger";
import notionTemplate from "@/templates/notion_config.json";
import googleTemplate from "@/templates/google_token.json";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import parseDatetimeFormat from "@/utils/server/parse-datetime";

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Default to us-east-1 if not specified
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_GOOGLE_TOKEN_PATH = process.env.S3_GOOGLE_TOKEN_PATH;
const S3_NOTION_CONFIG_PATH = process.env.S3_NOTION_CONFIG_PATH;
const S3_NOTION_TOKEN_PATH = process.env.S3_NOTION_TOKEN_PATH;

// Helper to convert AWS S3 stream to string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

/**
 * Upload Google OAuth tokens JSON to S3 under the user's folder
 * @param {string} userId  - UUID of the user
 * @param {object} tokens  - Token object returned by googleapis
 */
export async function uploadGoogleTokens(
  userId,
  userSub,
  userEmail,
  tokens,
  updatedAt,
) {
  if (!S3_BUCKET_NAME) throw new Error("Missing S3_BUCKET_NAME");
  if (!S3_GOOGLE_TOKEN_PATH) throw new Error("Missing S3_GOOGLE_TOKEN_PATH");
  if (!userId) throw new Error("Missing userId");
  if (!tokens?.access_token) throw new Error("Missing access_token");

  // Normalize scopes to array of unique strings
  const scopes = Array.isArray(tokens.scope)
    ? [...new Set(tokens.scope)]
    : typeof tokens.scope === "string"
      ? [...new Set(tokens.scope.trim().split(/\s+/).filter(Boolean))]
      : [];

  const payload = {
    userId,
    userSub: userSub || null,
    userEmail: userEmail || null,
    token: tokens.access_token,
    refresh_token: tokens.refresh_token || null,
    expiry: tokens.expiry_date ? parseDatetimeFormat(tokens.expiry_date) : null,
    scopes,
    updatedAt: updatedAt || new Date().toISOString(),
  };

  logger.sensitive("Uploading Google tokens to S3", {
    userId,
    tokens: "[masked]",
  });
  const key = `${userId}/${S3_GOOGLE_TOKEN_PATH}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(payload),
    ContentType: "application/json",
  });

  await s3Client.send(command);
  logger.info("Google tokens uploaded", { userId, key });
}

/**
 * Upload Notion config JSON to S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @param {object} config  - Notion configuration object
 */
export async function uploadNotionConfig(userId, config) {
  logger.sensitive("Uploading Notion config to S3", {
    userId,
    config: "[masked]",
  });
  const user_key = `${userId}/${S3_NOTION_CONFIG_PATH}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
    Body: JSON.stringify(config),
    ContentType: "application/json",
  });
  await s3Client.send(command);
  logger.info("Notion config upload successful for user", userId);
}

/**
 * Upload Template JSON to S3 under the user's folder
 * @param {string} userId - UUID of the user
 */
export async function uploadTemplates(userId) {
  if (!S3_BUCKET_NAME) throw new Error("Missing S3_BUCKET_NAME");

  const notionKey = `${userId}/${S3_NOTION_CONFIG_PATH}`;
  const googleKey = `${userId}/${S3_GOOGLE_TOKEN_PATH}`;
  logger.debug("S3 Notion Path:", notionKey);
  logger.debug("S3 Google Path:", googleKey);

  const putNotion = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: notionKey,
    Body: JSON.stringify(notionTemplate ?? {}),
    ContentType: "application/json",
  });

  const putGoogle = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: googleKey,
    Body: JSON.stringify(googleTemplate ?? {}),
    ContentType: "application/json",
  });

  // upload templates
  await Promise.all([s3Client.send(putNotion), s3Client.send(putGoogle)]);

  logger.info("Template upload successful for user", userId);
}

/**
 * Retrieve Notion Config JSON from S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @returns {object} - Parsed config object
 */
export async function getNotionConfig(userId) {
  if (!S3_NOTION_CONFIG_PATH) {
    throw new Error("Missing S3_NOTION_CONFIG_PATH environment variable");
  }
  logger.info("Retrieving Notion config from S3 for user", userId);
  const user_key = `${userId}/${S3_NOTION_CONFIG_PATH}`;
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
  });
  const response = await s3Client.send(command);
  const bodyString = await streamToString(response.Body);
  const parsed = JSON.parse(bodyString);
  logger.sensitive("Loaded config", "[masked]");
  return parsed;
}

/**
 * Check the last modified timestamp of a user's Notion config in S3
 * @param {string} userId - UUID of the user
 * @returns {Date|null} - LastModified timestamp or null if not found
 */
export async function getConfigLastModified(userId) {
  if (!S3_NOTION_CONFIG_PATH) {
    throw new Error("Missing S3_NOTION_CONFIG_PATH environment variable");
  }

  const user_key = `${userId}/${S3_NOTION_CONFIG_PATH}`;
  const command = new HeadObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
  });

  try {
    const response = await s3Client.send(command);
    return response.LastModified || null; // this is a Date object
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    logger.error("Failed to get last modified", err);
    throw err;
  }
}

/**
 * Upload Notion OAuth tokens JSON to S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @param {object} payload - Token object returned by Notion OAuth
 */
export async function uploadNotionTokens(userId, payload) {
  logger.sensitive("Uploading Notion tokens to S3", {
    userId,
    tokens: "[masked]",
  });
  const key = `${userId}/${S3_NOTION_TOKEN_PATH}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(payload),
    ContentType: "application/json",
  });
  await s3Client.send(command);
  logger.info("Notion tokens uploaded successfully for user", userId);
}

/** Check if Notion OAuth token file exists for user */
export async function notionTokenExists(userId) {
  if (!S3_NOTION_TOKEN_PATH) throw new Error("Missing S3_NOTION_TOKEN_PATH");
  const Key = `${userId}/${S3_NOTION_TOKEN_PATH}`;
  logger.info("Checking Notion token existence", { userId });
  const exists = await headExists(Key);
  return exists;
}

/** Load Google OAuth token JSON and check emptiness. Only check "token" field. */
export async function googleTokenExists(userId) {
  if (!S3_GOOGLE_TOKEN_PATH) throw new Error("Missing S3_GOOGLE_TOKEN_PATH");
  const Key = `${userId}/${S3_GOOGLE_TOKEN_PATH}`;
  logger.info("Retrieving Google tokens from S3", { userId });

  const exists = await headExists(Key);
  if (!exists) return false;

  const token = await getJson(Key);
  const isEmpty = !token || typeof token.token !== "string" || token.token.length === 0;

  return !isEmpty;
}

async function headExists(Key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET_NAME, Key }));
    return true;
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === "NotFound") return false;
    throw e;
  }
}

async function getJson(Key) {
  const res = await s3Client.send(new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key }));
  const text = await streamToString(res.Body);
  return text ? JSON.parse(text) : null;
}
