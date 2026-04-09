"use client";

import { useReadability } from "@/context/ReadabilityContext";

export default function ReadabilityToolbar({ title = "Reading controls" }) {
  const {
    textSize,
    canDecrease,
    canIncrease,
    decreaseTextSize,
    increaseTextSize,
    resetTextSize,
  } = useReadability();

  return (
    <div
      className="position-sticky top-0 z-3 mb-4"
      style={{
        paddingTop: "0.75rem",
      }}
    >
      <div
        className="d-inline-flex align-items-center gap-2 rounded-pill border shadow-sm px-2 py-2"
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(11, 61, 46, 0.12)",
        }}
        role="toolbar"
        aria-label={title}
      >
        <span className="small fw-semibold text-muted px-2 d-none d-sm-inline">
          {title}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-light btn-ripple rounded-pill px-3"
          onClick={decreaseTextSize}
          disabled={!canDecrease}
          aria-label="Decrease text size"
        >
          A-
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary btn-ripple rounded-pill px-3"
          onClick={resetTextSize}
          aria-label="Reset text size"
        >
          Reset
        </button>

        <button
          type="button"
          className="btn btn-sm btn-light btn-ripple rounded-pill px-3"
          onClick={increaseTextSize}
          disabled={!canIncrease}
          aria-label="Increase text size"
        >
          A+
        </button>

        <span className="badge bg-dark-subtle rounded-pill ms-1" style={{ color: "var(--primary-color)" }}>
          {textSize}
        </span>
      </div>
    </div>
  );
}
