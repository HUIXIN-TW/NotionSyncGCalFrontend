import "server-only";
import logger from "@/utils/shared/logger";
import notionTemplate from "@/templates/notion_config.json";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

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
export async function uploadNotionConfigTemplates(userId) {
  if (!S3_BUCKET_NAME) throw new Error("Missing S3_BUCKET_NAME");

  const notionKey = `${userId}/${S3_NOTION_CONFIG_PATH}`;
  logger.debug("S3 Notion Path:", notionKey);

  const putNotion = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: notionKey,
    Body: JSON.stringify(notionTemplate ?? {}),
    ContentType: "application/json",
  });

  try {
    // upload templates
    await s3Client.send(putNotion);
    logger.info("Template upload successful for user", userId);
  } catch (err) {
    logger.error("Failed to upload templates to S3", err);
    throw err;
  }
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
export async function getNotionConfigLastModified(userId) {
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
