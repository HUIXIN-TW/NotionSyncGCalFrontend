/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
  // bundle in frontend code that uses process.env.NEXT_PUBLIC_*
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    DYNAMODB_USER_TABLE: process.env.DYNAMODB_USER_TABLE,
    DYNAMODB_RATE_LIMIT_TABLE: process.env.DYNAMODB_RATE_LIMIT_TABLE,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_GOOGLE_KEY: process.env.S3_GOOGLE_KEY,
    S3_NOTION_KEY: process.env.S3_NOTION_KEY,
    SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
    SQS_REGION: process.env.SQS_REGION,
  },
};

module.exports = nextConfig;
