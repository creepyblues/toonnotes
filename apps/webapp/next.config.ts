import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@toonnotes/editor-web'],
  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
