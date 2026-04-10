const fs = require('fs');

const file = 'backend/server.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('const helmet = require("helmet");') && !content.includes("require('helmet')")) {
    content = content.replace(
      "const cors = require('cors');",
      "const cors = require('cors');\nconst helmet = require('helmet');\nconst { generalLimiter, strictLimiter } = require('./src/middleware/rateLimiter');"
    );
  }

  if (!content.includes('app.use(helmet());')) {
    content = content.replace(
      'app.use(cors());',
      'app.use(helmet());\napp.use(cors());\napp.use(generalLimiter);'
    );
  }

  if (!content.includes('strictLimiter, authRoutes')) {
    content = content.replace(
      "app.use('/auth', authRoutes);",
      "app.use('/auth', strictLimiter, authRoutes);"
    );
  }
  
  if (!content.includes('strictLimiter, donationRoutes')) {
    content = content.replace(
      "app.use('/donations', donationRoutes);",
      "app.use('/donations', strictLimiter, donationRoutes);"
    );
  }
  
  if (!content.includes('strictLimiter, stripeRoutes')) {
    content = content.replace(
      "app.use('/stripe', stripeRoutes);",
      "app.use('/stripe', strictLimiter, stripeRoutes);"
    );
  }

  fs.writeFileSync(file, content);
} else {
  console.log("File not found:", file);
}
