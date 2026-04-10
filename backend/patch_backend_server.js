const fs = require('fs');

const file = 'backend/server.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Inject Helmet and RateLimiters
  if (!content.includes('const helmet = require("helmet");')) {
    content = content.replace(
      "const cors = require('cors');",
      "const cors = require('cors');\nconst helmet = require('helmet');\nconst { generalLimiter, strictLimiter } = require('./src/middleware/rateLimiter');"
    );
  }

  // Inject Middlewares
  if (!content.includes('app.use(helmet());')) {
    content = content.replace(
      'app.use(cors());',
      'app.use(helmet());\napp.use(cors());\napp.use(generalLimiter); // Apply global rate limiter to all routes'
    );
  }

  // Apply strict limiter to Auth
  content = content.replace(
    "app.use('/auth', authRoutes);",
    "app.use('/auth', strictLimiter, authRoutes); // Apply strict limiter to prevent brute force"
  );
  
  // Apply strict limiter to Donations
  content = content.replace(
    "app.use('/donations', donationRoutes);",
    "app.use('/donations', strictLimiter, donationRoutes); // Prevent card testing/spam"
  );
  
  // Apply strict limiter to Stripe
  content = content.replace(
    "app.use('/stripe', stripeRoutes);",
    "app.use('/stripe', strictLimiter, stripeRoutes);"
  );

  fs.writeFileSync(file, content);
}
