import notionTemplate from "@/templates/notion_setting.json";
import googleTemplate from "@/templates/token.json";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import parseDatetimeFormat from "./parse-datetime";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1", // Default to us-east-1 if not specified
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_GOOGLE_KEY = process.env.S3_GOOGLE_KEY;
const S3_NOTION_KEY = process.env.S3_NOTION_KEY;

// Add Google OAuth configuration defaults
const GOOGLE_TOKEN_URL =
  process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

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
export async function uploadGoogleTokens(userId, userSub, userEmail, tokens, updatedAt) {
  console.log("Uploading Google tokens to S3:", userId, tokens);
  console.log("S3_BUCKET_NAME:", S3_BUCKET_NAME);
  console.log("S3_GOOGLE_KEY:", S3_GOOGLE_KEY);
  const payload = {
    userId: userId,
    userSub: userSub,
    userEmail: userEmail,
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_uri: GOOGLE_TOKEN_URL,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    expiry: parseDatetimeFormat(tokens.expiry_date),
    scopes: [tokens.scope],
    updatedAt: updatedAt,
  };
  console.log("Payload:", payload);
  const user_key = `${userId}/${S3_GOOGLE_KEY}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
    Body: JSON.stringify(payload),
    ContentType: "application/json",
  });
  await s3Client.send(command);
  console.log("Upload successful for user:", userId);
}

/**
 * Upload Notion config JSON to S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @param {object} config  - Notion configuration object
 */
export async function uploadNotionConfig(userId, config) {
  console.log("Uploading Notion config to S3:", userId, config);
  const user_key = `${userId}/${S3_NOTION_KEY}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
    Body: JSON.stringify(config),
    ContentType: "application/json",
  });
  await s3Client.send(command);
  console.log("Notion config upload successful for user:", userId);
}

/**
 * Upload Template JSON to S3 under the user's folder
 * @param {string} userId - UUID of the user
 */
export async function uploadTemplates(userId) {
  if (!S3_BUCKET_NAME) throw new Error("Missing S3_BUCKET_NAME");

  const notionKey = `${userId}/${S3_NOTION_KEY}`;
  const googleKey = `${userId}/${S3_GOOGLE_KEY}`;
  console.log("S3 Notion Path: ", notionKey);
  console.log("S3 Google Path: ", googleKey);

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

  console.log("Template upload successful for user:", userId);
}

/**
 * Retrieve Notion Config JSON from S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @returns {object} - Parsed config object
 */
export async function getNotionConfig(userId) {
  if (!S3_NOTION_KEY) {
    throw new Error("Missing S3_NOTION_KEY environment variable");
  }
  console.log("Retrieving Notion config from S3 for user:", userId);
  const user_key = `${userId}/${S3_NOTION_KEY}`;
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
  });
  const response = await s3Client.send(command);
  const bodyString = await streamToString(response.Body);
  const parsed = JSON.parse(bodyString);
  console.log("Loaded config:", parsed);
  return parsed;
}

/**
 * Check the last modified timestamp of a user's Notion config in S3
 * @param {string} userId - UUID of the user
 * @returns {Date|null} - LastModified timestamp or null if not found
 */
export async function getConfigLastModified(userId) {
  if (!S3_NOTION_KEY) {
    throw new Error("Missing S3_NOTION_KEY environment variable");
  }

  const user_key = `${userId}/${S3_NOTION_KEY}`;
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
    console.error("Failed to get last modified:", err);
    throw err;
  }
}
