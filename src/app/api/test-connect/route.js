import "server-only";

import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { notionTokenExists, googleTokenExists } from "@/utils/server/s3-client";
import { enforceDDBThrottle } from "@/utils/server/throttle";
import { testConnectionRules } from "@/utils/server/throttle-rule";

/**
 * Simple endpoint to test connectivity and token existence.
 * GET /api/test-connect
 */
export async function GET(req) {
  try {
    // Auth check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { type: "auth error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = token.uuid;
    if (!userId) {
      return NextResponse.json(
        { type: "auth error", message: "Invalid session" },
        { status: 400 },
      );
    }

    logger.info("Testing token connection for user", { userId });

    // Check S3 token existence
    const [hasNotion, hasGoogle] = await Promise.all([
      notionTokenExists(userId),
      googleTokenExists(userId),
    ]);

    // Only enforce throttle in production environment
    if (isProd) {
      const throttleResult = await enforceDDBThrottle(
        testConnectionRules(userId),
      );
      if (throttleResult) {
        return NextResponse.json(
          {
            type: "throttle error",
            message: throttleResult.body.error,
            needRefresh: false,
          },
          { status: throttleResult.status },
        );
      }
    }

    return NextResponse.json({
      type: "connection test",
      message: "Token status checked",
      userId,
      hasNotion,
      hasGoogle,
      isProd,
    });
  } catch (err) {
    logger.error("test-connect error", err);
    return NextResponse.json(
      { type: "error", message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
