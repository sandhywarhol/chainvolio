/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '../../.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tlbxjzruyytontxwvwtl.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
