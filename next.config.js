/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["topojson-client"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tlbxjzruyytontxwvwtl.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // BUG-003: /developer (tanpa s) → /developers
      {
        source: '/developer',
        destination: '/developers',
        permanent: true,
      },
      // BUG-001: old screening path
      {
        source: '/guides/screening-protocol',
        destination: '/guides/screening',
        permanent: true,
      },
      // BUG-002: old attestation path
      {
        source: '/guides/attestation-proof-standards',
        destination: '/guides/attestation',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
