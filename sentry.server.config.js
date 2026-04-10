import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy-dsn@sentry.io/12345",
  tracesSampleRate: 1,
  debug: false,
});
