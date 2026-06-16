import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iPhone'dan erişim için cross-origin izni
  allowedDevOrigins: ['192.168.1.4'],
};

export default nextConfig;
