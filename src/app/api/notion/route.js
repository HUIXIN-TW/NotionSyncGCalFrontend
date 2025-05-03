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
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
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
    return new Response(JSON.stringify({ error: "Failed to load config" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const uuid = token?.uuid;

  if (!uuid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let incomingConfig;
  try {
    incomingConfig = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
    });
  }

  if (!incomingConfig || typeof incomingConfig !== "object") {
    return new Response(JSON.stringify({ error: "Invalid config format" }), {
      status: 400,
    });
  }

  let mergedConfig = { ...incomingConfig };

  try {
    let existingConfig = {};

    // get existing config from S3
    try {
      existingConfig = await getNotionConfig(uuid);
    } catch (err) {
      console.warn("No existing config found, proceeding with new upload.");
    }

    if (
      incomingConfig.notion_token === "secret_**********************" &&
      existingConfig.notion_token
    ) {
      mergedConfig.notion_token = existingConfig.notion_token;
    }

    const lastModified = await getConfigLastModified(uuid);
    if (!lastModified) {
      return new Response(
        JSON.stringify({ error: "Missing last modified timestamp" }),
        { status: 403 },
      );
    }

    const timeGap = Date.now() - new Date(lastModified).getTime();
    if (isProd && timeGap < THROTTLE_MS) {
      console.log(`[UPLOAD BLOCKED] User: ${uuid}, Time Gap: ${timeGap}ms`);
      return new Response(
        JSON.stringify({ error: "Too frequent update. Please wait." }),
        { status: 429 },
      );
    }
  } catch (err) {
    console.error("Failed to check last modified timestamp:", err);
    return new Response(
      JSON.stringify({ error: "Failed to validate upload frequency" }),
      { status: 500 },
    );
  }

  try {
    await uploadNotionConfig(uuid, mergedConfig);
    return new Response(JSON.stringify({ message: "Uploaded successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Failed to upload config:", err);
    return new Response(JSON.stringify({ error: "Upload to S3 failed" }), {
      status: 500,
    });
  }
}
