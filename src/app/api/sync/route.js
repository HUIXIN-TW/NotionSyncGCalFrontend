import { getToken } from "next-auth/jwt";

const url = process.env.LAMBDA_URL;
const apiKey = process.env.LAMBDA_API_KEY;

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(
      JSON.stringify({
        type: "auth error",
        message: "Unauthorized",
        needRefresh: false,
      }),
      { status: 401 },
    );
  }

  if (!url || !apiKey) {
    console.error("Missing Lambda URL or API Key");
    return new Response(
      JSON.stringify({
        type: "config error",
        message: "Missing Lambda config",
        needRefresh: false,
      }),
      { status: 500 },
    );
  }

  let uuid;
  try {
    const body = await req.json();
    uuid = body.uuid;
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(
      JSON.stringify({
        type: "parse error",
        message: "Invalid request body",
        needRefresh: false,
      }),
      { status: 400 },
    );
  }

  if (!uuid || uuid !== token.uuid) {
    console.warn(`UUID mismatch: received=${uuid}, expected=${token.uuid}`);
    return new Response(
      JSON.stringify({
        type: "auth error",
        message: "UUID mismatch",
        needRefresh: false,
      }),
      { status: 403 },
    );
  }

  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ uuid, timestamp }),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    if (!response.ok) {
      console.error("Lambda returned error:", result);
      const needRefresh =
        result.message?.includes("invalid_grant") ||
        !result.expiry_date ||
        result.expiry_date === "" ||
        false;

      return new Response(
        JSON.stringify({
          type: "sync error",
          message: result.message || "Lambda sync failed",
          needRefresh,
        }),
        { status: 500 },
      );
    }

    console.log(`User ${uuid} synced successfully at ${timestamp}`);
    return new Response(
      JSON.stringify({
        type: "success",
        message: "Sync successful",
        needRefresh: false,
        ...result, // include Lambda details if any
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to call Lambda:", error?.message || error);
    return new Response(
      JSON.stringify({
        type: "network error",
        message: "Internal Server Error",
        needRefresh: false,
      }),
      { status: 500 },
    );
  }
}
