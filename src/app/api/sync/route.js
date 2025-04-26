import { getToken } from "next-auth/jwt";

const url = process.env.MY_APP_AWS_LAMBDA_URL;
const apiKey = process.env.MY_APP_AWS_LAMBDA_API_KEY;

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let uuid;

  try {
    const body = await req.json();
    uuid = body.uuid;
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  if (!uuid || uuid !== token.uuid) {
    console.warn(`UUID mismatch: received=${uuid}, expected=${token.uuid}`);
    return new Response(JSON.stringify({ error: "Forbidden: UUID mismatch" }), { status: 403 });
  }

  const timestamp = new Date().toISOString();

  try {
    console.log(`Syncing user ${uuid} at ${timestamp}`);
    console.log("Request body:", { uuid, timestamp });
    console.log("Lambda URL:", url);
    console.log("Lambda API Key:", apiKey);
    console.log("Request headers:", {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        uuid,
        timestamp,
      }),
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
      return new Response(JSON.stringify({ error: result.error || "Lambda sync failed" }), { status: response.status });
    }

    console.log(`User ${uuid} synced successfully at ${timestamp}`);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Failed to call Lambda:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
