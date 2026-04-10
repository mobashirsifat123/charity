const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
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
    ],
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
});
