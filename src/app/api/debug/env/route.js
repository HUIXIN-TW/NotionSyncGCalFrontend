import "server-only";

export const runtime = "nodejs";

// curl -s -u '<username>:<password>' <endpoint> | jq
export async function GET() {
  const keys = [
    "NODE_ENV",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DYNAMODB_REGION",
    "DYNAMODB_USER_TABLE",
    "S3_REGION",
    "S3_BUCKET_NAME",
    "S3_GOOGLE_KEY",
    "S3_NOTION_KEY",
    "SQS_REGION",
    "SQS_QUEUE_URL",
  ];
  const presence = Object.fromEntries(
    keys.map((k) => [k, process.env[k] ? true : false]),
  );
  return new Response(JSON.stringify(presence, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
