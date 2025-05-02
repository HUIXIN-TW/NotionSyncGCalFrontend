import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import parseDatetimeFormat from "./parse-datetime";

const s3Client = new S3Client({
  region: process.env.MYAPP_AWS_REGION || "us-east-1", // Default to us-east-1 if not specified
  credentials: {
    accessKeyId: process.env.MYAPP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MYAPP_AWS_SECRET_ACCESS_KEY,
  },
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
export async function uploadGoogleTokens(userId, tokens) {
  console.log("Uploading Google tokens to S3:", userId, tokens);
  console.log("S3_BUCKET_NAME:", S3_BUCKET_NAME);
  console.log("S3_GOOGLE_KEY:", S3_GOOGLE_KEY);
  const payload = {
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_uri: GOOGLE_TOKEN_URL,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    expiry: parseDatetimeFormat(tokens.expiry_date),
    scopes: [tokens.scope],
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
 * Retrieve Notion Config JSON from S3 under the user's folder
 * @param {string} userId - UUID of the user
 * @returns {object} - Parsed config object
 */
export async function getNotionConfig(userId) {
  const user_key = `${userId}/${S3_NOTION_KEY}`;
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: user_key,
  });
  const response = await s3Client.send(command);
  const body = await streamToString(response.Body);
  const payload = {
    "goback_days": body.goback_days,
    "goforward_days": body.goforward_days,
    "notion_token": "secret_**********************",
    "urlroot": body.urlroot,
    "timecode": body.timecode,
    "timezone": body.timezone,
    "default_event_length": body.default_event_length,
    "default_start_time": body.default_start_time,
    "gcal_dic": body.gcal_dic,
    "page_property": body.page_property
  }
  return JSON.parse(payload);
}
