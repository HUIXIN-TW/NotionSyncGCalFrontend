import { getToken } from "next-auth/jwt";
import {
  getConfigLastModified,
  getNotionConfig,
  uploadNotionConfig,
} from "@utils/s3-client";

const isProd = process.env.NODE_ENV === "production";
const THROTTLE_MS = 30 * 60 * 1000; // 30 minutes

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
    console.error("Error loading config or metadata from S3:", err);
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
  if (!incomingConfig.notion_token || !incomingConfig.urlroot) {
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Missing required config fields: notion_token or urlroot",
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
      console.warn("No existing config found, proceeding with new upload.");
      console.error("Failed to load existing config:", err);
    }

    // Preserve masked token (minimum 6 asterisks)
    if (
      /^[\*]{6,}$/.test(incomingConfig.notion_token) &&
      existingConfig.notion_token
    ) {
      mergedConfig.notion_token = existingConfig.notion_token;
      if (!isProd) {
        console.log("Masked token detected, preserving original token.");
        console.log("Incoming (masked):", incomingConfig.notion_token);
        console.log("Replacing with:", existingConfig.notion_token);
      }
    }

    // Throttle protection if lastModified exists
    const lastModified = await getConfigLastModified(uuid);
    if (lastModified) {
      const timeGap = Date.now() - new Date(lastModified).getTime();
      const waitMinutes = Math.ceil((THROTTLE_MS - timeGap) / (1000 * 60));
      if (isProd && timeGap < THROTTLE_MS) {
        console.log(`[UPLOAD BLOCKED] User: ${uuid}, Time Gap: ${timeGap}ms`);
        return new Response(
          JSON.stringify({
            type: "throttle error",
            message: `Too frequent update. Please wait ~${waitMinutes} minute(s).`,
          }),
          { status: 429 },
        );
      }
    } else {
      console.log("No previous config timestamp — skipping throttle check.");
    }

    if (!isProd) {
      console.log("Merged config to upload:", mergedConfig);
    }
  } catch (err) {
    console.error("Failed to validate upload frequency:", err);
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
    console.error("Failed to upload config:", err);
    return new Response(
      JSON.stringify({
        type: "error",
        message: "Upload to S3 failed",
      }),
      { status: 500 },
    );
  }
}
