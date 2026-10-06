import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  // Allow external IPs (like phone hotspots) to download client JS in dev mode
  allowedDevOrigins: [
    '192.168.100.199', 
    'http://192.168.100.199',
    'http://192.168.100.199:3000',
    'localhost'
  ],
};

export default nextConfig;
