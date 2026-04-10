"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            flexDirection: "column",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h1 style={{ color: "#dc3545", margin: "0 0 1rem 0" }}>
              Critical Error
            </h1>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6c757d" }}>
              A fatal error occurred rendering the application layout.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "10px 20px",
                background: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
