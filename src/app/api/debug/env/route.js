import "server-only";

export const runtime = "nodejs";

// curl -s -u '<username>:<password>' <endpoint> | jq
export async function GET() {
  const secretKeys = [
    "NODE_ENV",
    // "NEXTAUTH_SECRET",
    // "GOOGLE_CLIENT_SECRET",
    // "AWS_REGION",
    // "DYNAMODB_USER_TABLE",
    // "DYNAMODB_RATE_LIMIT_TABLE",
    // "S3_BUCKET_NAME",
    // "S3_GOOGLE_TOKEN_PATH",
    // "S3_NOTION_CONFIG_PATH",
    // "S3_NOTION_TOKEN_PATH",
    // "SQS_QUEUE_URL",
  ];
  const presence = Object.fromEntries(
    secretKeys.map((k) => [k, process.env[k] ? true : false]),
  );
  return new Response(JSON.stringify(presence, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
