/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
  // bundle in frontend code that uses process.env.NEXT_PUBLIC_*
  // env: {
  // },
};

module.exports = nextConfig;
