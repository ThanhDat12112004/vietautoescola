/** @type {import('next').NextConfig} */
const API_ORIGIN =
  process.env.INTERNAL_API_BASE_URL ||
  process.env.API_ORIGIN ||
  'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
      encoding: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${API_ORIGIN}/media/:path*`,
      },
      {
        source: '/materials-api/:path*',
        destination: `${API_ORIGIN}/materials/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${API_ORIGIN}/auth/:path*`,
      },
      {
        source: '/stats/:path*',
        destination: `${API_ORIGIN}/stats/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
