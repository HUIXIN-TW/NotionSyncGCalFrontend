/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone', 
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MYAPP_AWS_REGION: process.env.MYAPP_AWS_REGION,
    MYAPP_AWS_ACCESS_KEY_ID: process.env.MYAPP_AWS_ACCESS_KEY_ID,
    MYAPP_AWS_SECRET_ACCESS_KEY: process.env.MYAPP_AWS_SECRET_ACCESS_KEY,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
  },
};

module.exports = nextConfig;
