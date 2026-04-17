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
    <div className="readability-toolbar-shell position-sticky top-0 z-3 mb-4">
      <div className="readability-toolbar" role="toolbar" aria-label={title}>
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

        <span className="readability-toolbar__badge badge rounded-pill ms-1">
          {textSize}
        </span>
      </div>
    </div>
  );
}
