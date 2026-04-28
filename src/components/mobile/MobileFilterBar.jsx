"use client";

export default function MobileFilterBar({
  value,
  onSearchChange,
  placeholder = "Search...",
  chips = [],
  activeChip = "all",
  onChipChange,
  resetLabel = "Reset",
  onReset,
  className = "",
}) {
  return (
    <div className={`mobile-filter-bar ${className}`}>
      <div className="mobile-filter-bar__search">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="search"
          value={value}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={placeholder}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onSearchChange?.("")}
            aria-label="Clear search"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        ) : null}
      </div>

      <div className="mobile-filter-bar__chips">
        {chips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={activeChip === chip.value ? "is-active" : ""}
            onClick={() => onChipChange?.(chip.value)}
          >
            {chip.icon ? <i className={`fa-solid ${chip.icon}`} /> : null}
            <span>{chip.label}</span>
          </button>
        ))}
        {onReset ? (
          <button type="button" onClick={onReset}>
            <i className="fa-solid fa-rotate-left" />
            <span>{resetLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
