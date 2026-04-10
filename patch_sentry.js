const fs = require('fs');

const file = 'backend/server.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Insert Sentry initialization
  if (!content.includes("require('@sentry/node')")) {
    content = content.replace(
      "const cors = require('cors');",
      "const cors = require('cors');\nconst Sentry = require('@sentry/node');\nconst { nodeProfilingIntegration } = require('@sentry/profiling-node');\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN || 'https://dummy-dsn@sentry.io/12345',\n  integrations: [\n    nodeProfilingIntegration(),\n  ],\n  tracesSampleRate: 1.0,\n  profilesSampleRate: 1.0,\n});"
    );
  }

  // Sentry uses Sentry.setupExpressErrorHandler(app); immediately after app = express()
  if (!content.includes('Sentry.setupExpressErrorHandler(app);')) {
    content = content.replace(
      "const PORT = process.env.PORT || 5050;",
      "const PORT = process.env.PORT || 5050;\n\nSentry.setupExpressErrorHandler(app);"
    );
  }

  fs.writeFileSync(file, content);
}
