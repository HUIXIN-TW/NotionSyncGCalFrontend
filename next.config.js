/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    DYNAMODB_REGION: process.env.DYNAMODB_REGION,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_GOOGLE_KEY: process.env.S3_GOOGLE_KEY,
    S3_NOTION_KEY: process.env.S3_NOTION_KEY,
    LAMBDA_URL: process.env.LAMBDA_URL,
    LAMBDA_API_KEY: process.env.LAMBDA_API_KEY,
  },
};

module.exports = nextConfig;
