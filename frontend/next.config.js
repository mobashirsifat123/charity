/** @type {import('next').NextConfig} */

// Parse the backend API URL to build the remote image pattern
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const parsedUrl = new URL(apiUrl);

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // Always allow localhost for local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // Allow the production backend domain (set via NEXT_PUBLIC_API_URL)
      ...(parsedUrl.hostname !== 'localhost'
        ? [
            {
              protocol: parsedUrl.protocol.replace(':', ''),
              hostname: parsedUrl.hostname,
              port: parsedUrl.port || '',
              pathname: '/uploads/**',
            },
          ]
        : []),
      // Allow Supabase Storage images
      {
        protocol: 'https',
        hostname: 'kpvcuclyctjlmvqhfkdct.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
