/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ entfernt: output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
