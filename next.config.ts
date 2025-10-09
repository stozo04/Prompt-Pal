import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rfzoiqeusythlsyaipaa.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  eslint: {
    // ✅ Don’t fail the Vercel build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Don’t fail the Vercel build on TS type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
