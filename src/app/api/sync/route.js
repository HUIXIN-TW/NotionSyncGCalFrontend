import logger from "@utils/logger";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { sendSyncJobMessage } from "@/utils/sqs-client";
import { enforceThrottle, extractClientIp } from "@/utils/throttle";
import { syncRules } from "@/utils/throttle-rule";

// const url = process.env.LAMBDA_URL;
// const apiKey = process.env.LAMBDA_API_KEY;

export async function POST(req) {
  // AuthN
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json(
      { type: "auth error", message: "Unauthorized", needRefresh: false },
      { status: 401 },
    );
  }

  // if (!token) {
  //   return new Response(
  //     JSON.stringify({
  //       type: "auth error",
  //       message: "Unauthorized",
  //       needRefresh: false,
  //     }),
  //     { status: 401 },
  //   );
  // }

  // api gateway call lambda function
  // if (!url || !apiKey) {
  //   console.error("Missing Lambda URL or API Key");
  //   return new Response(
  //     JSON.stringify({
  //       type: "config error",
  //       message: "Missing Lambda config",
  //       needRefresh: false,
  //     }),
  //     { status: 500 },
  //   );
  // }

  let payload = {};
  try {
    const text = await req.text();
    payload = text ? JSON.parse(text) : {};
  } catch (e) {
    logger.error("Body parse error", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { type: "parse error", message: "Invalid JSON body", needRefresh: false },
      { status: 400 },
    );
  }

  const uuid = payload?.uuid;
  if (typeof uuid !== "string" || uuid.length < 8) {
    return NextResponse.json(
      { type: "validation error", message: "Invalid uuid", needRefresh: false },
      { status: 400 },
    );
  }

  // AuthZ：uuid must be the same as token
  if (uuid !== token.uuid) {
    logger.warn(`UUID mismatch received=${uuid} expected=${token.uuid}`);
    return NextResponse.json(
      { type: "auth error", message: "UUID mismatch", needRefresh: false },
      { status: 403 },
    );
  }

  // Throttle by IP and by user UUID
  const ip = extractClientIp(req) || null;
  if (!ip) {
    return NextResponse.json(
      { success: false, error: "Unable to determine client IP" },
      { status: 400 },
    );
  }
  const throttleResult = await enforceThrottle(syncRules(ip, uuid));
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

  const timestamp = new Date().toISOString();
  try {
    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-api-key": apiKey,
    //   },
    //   body: JSON.stringify({ uuid, timestamp }),
    // });

    // const text = await response.text();
    // let result;
    // try {
    //   result = JSON.parse(text);
    // } catch {
    //   result = { raw: text };
    // }

    // if (!response.ok) {
    //   console.error("Lambda returned error:", result);
    //   const needRefresh =
    //     result?.message?.includes("invalid_grant") ||
    //     !result?.expiry_date ||
    //     !result?.refresh_token ||
    //     !result?.token ||
    //     !result?.client_id ||
    //     !result?.client_secret;

    //   return new Response(
    //     JSON.stringify({
    //       type: "sync error",
    //       message: result.message || "Lambda sync failed",
    //       needRefresh,
    //     }),
    //     { status: 500 },
    //   );
    // }

    // console.log(`User ${uuid} synced successfully at ${timestamp}`);
    // return new Response(
    //   JSON.stringify({
    //     type: "success",
    //     message: "Sync successful",
    //     needRefresh: false,
    //     ...result, // include Lambda details if any
    //   }),
    //   { status: 200 },
    // );

    // todo action enum -t, -n, -g
    const action = "user.sync";
    const source = "NotionSyncGCalFrontend";

    const res = await sendSyncJobMessage({ action, uuid, timestamp, source });
    const messageId = res?.MessageId || res?.MessageID || res?.messageId;

    if (!messageId) {
      throw new Error("SQS enqueue returned no MessageId");
    }

    logger.info(`Sync enqueued`, { uuid, messageId, action, source });

    return NextResponse.json(
      {
        type: "accepted",
        message: "Sync task enqueued",
        needRefresh: false,
        messageId,
      },
      { status: 202 },
    );
  } catch (err) {
    logger.error("Enqueue failed", err?.message || err);
    return NextResponse.json(
      {
        type: "queue error",
        message: "Internal Server Error",
        needRefresh: false,
      },
      { status: 500 },
    );
  }
}
