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
    DYNAMODB_REGION: process.env.DYNAMODB_REGION,
    S3_REGION: process.env.S3_REGION,
  },
};

module.exports = nextConfig;
