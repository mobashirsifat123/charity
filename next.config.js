const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5050',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'kpvculyctjlmvqhfkdct.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
