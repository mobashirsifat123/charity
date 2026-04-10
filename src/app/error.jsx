"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry in the future
    console.error("Runtime Application Error:", error);
  }, [error]);

  return (
    <div className="d-flex align-items-center justify-content-center py-5 my-5">
      <div
        className="text-center p-5 shadow-sm rounded border bg-white"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="display-4 fw-bold text-danger mb-3">Oops!</h1>
        <h2 className="h4 mb-3">Something went wrong.</h2>
        <p className="text-muted mb-4">
          We apologize for the inconvenience. An unexpected application error
          has occurred. Our team has been notified.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <button
            onClick={() => reset()}
            className="btn btn-primary px-4 py-2 rounded-pill"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
