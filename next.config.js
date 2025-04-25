/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone', 
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.layers = true;
    return config;
  },
};

module.exports = nextConfig;
