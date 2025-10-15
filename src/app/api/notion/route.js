import logger from "@utils/logger";
import { getToken } from "next-auth/jwt";
import {
  getConfigLastModified,
  getNotionConfig,
  uploadNotionConfig,
} from "@/utils/server/s3-client";
import { enforceS3Throttle } from "@/utils/server/throttle";

const isProd = ["master", "production"].includes(
  (process.env.AWS_BRANCH || "").toLowerCase(),
);

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const uuid = token?.uuid;

  if (!uuid) {
    return new Response(
      JSON.stringify({
        type: "unauthorized",
        message: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  try {
    const [config, lastModified] = await Promise.all([
      getNotionConfig(uuid),
      getConfigLastModified(uuid),
    ]);

    return new Response(
      JSON.stringify({
        config,
        lastModified: lastModified?.toISOString() ?? null,
      }),
      { status: 200 },
    );
  } catch (err) {
    logger.error("Error loading config or metadata from S3", err);
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Failed to load config",
      }),
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const uuid = token?.uuid;

  if (!uuid) {
    return new Response(
      JSON.stringify({
        type: "unauthorized",
        message: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  let incomingConfig;
  try {
    incomingConfig = await req.json();
  } catch {
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Invalid JSON payload",
      }),
      { status: 400 },
    );
  }

  if (!incomingConfig || typeof incomingConfig !== "object") {
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Invalid config format",
      }),
      { status: 400 },
    );
  }

  // Basic validation of required fields
  if (!incomingConfig.database_id) {
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Missing required config fields: database id",
      }),
      { status: 400 },
    );
  }

  let mergedConfig = { ...incomingConfig };

  try {
    let existingConfig = {};

    try {
      existingConfig = await getNotionConfig(uuid);
    } catch (err) {
      logger.warn("No existing config found, proceeding with new upload.");
      logger.error("Failed to load existing config", err);
    }

    // Preserve masked token (minimum 6 asterisks)
    if (
      /^[\*]{6,}$/.test(incomingConfig.notion_token) &&
      existingConfig.notion_token
    ) {
      mergedConfig.notion_token = existingConfig.notion_token;
      logger.info("Masked token detected, preserving original token.");
      logger.sensitive("Incoming (masked)", "[masked]");
      logger.sensitive("Replacing with", "[masked]");
    }

    const s3Block = await enforceS3Throttle({ uuid });
    if (s3Block && isProd)
      return new Response(JSON.stringify(s3Block.body), {
        status: s3Block.status,
      });
  } catch (err) {
    logger.error("Failed to validate upload frequency", err);
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Failed to validate upload frequency",
      }),
      { status: 500 },
    );
  }

  try {
    await uploadNotionConfig(uuid, mergedConfig);
    return new Response(
      JSON.stringify({
        type: "success",
        message: "Uploaded successfully",
        uuid,
      }),
      { status: 200 },
    );
  } catch (err) {
    logger.error("Failed to upload config", err);
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Upload to S3 failed",
      }),
      { status: 500 },
    );
  }
}
