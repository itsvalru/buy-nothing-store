import { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "api.dicebear.com",
      "nfakxolmkymsywhjwyqr.supabase.co",
      "i.pinimg.com",
    ],
  },
};

export default nextConfig;
