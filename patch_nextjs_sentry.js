const fs = require('fs');

const file = 'next.config.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('withSentryConfig')) {
    content = `const { withSentryConfig } = require("@sentry/nextjs");\n\n` + content;
    content = content.replace(
      "module.exports = nextConfig;",
      `module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
});`
    );
    fs.writeFileSync(file, content);
  }
}
