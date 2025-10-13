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
    NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
    APP_ENV: process.env.APP_ENV || "production",
  },
};

module.exports = nextConfig;
