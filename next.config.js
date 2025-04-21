/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
};

module.exports = nextConfig;
