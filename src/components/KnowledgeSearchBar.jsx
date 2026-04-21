"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SEARCH_TYPES = [
  { value: "all", label: "All" },
  { value: "blog", label: "Articles" },
  { value: "fatwa", label: "Fatwas" },
];

export default function KnowledgeSearchBar({
  className = "",
  variant = "light",
  placeholder = "Search articles, fatwas, Quran topics...",
  defaultType = "all",
  value,
  onChange,
  onSearch,
}) {
  const router = useRouter();
  const [query, setQuery] = useState(value || "");
  const [type, setType] = useState(defaultType);
  const activeQuery = value ?? query;

  const updateQuery = (nextQuery) => {
    if (onChange) {
      onChange(nextQuery);
      return;
    }

    setQuery(nextQuery);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedQuery = activeQuery.trim();

    if (onSearch) {
      onSearch({ query: trimmedQuery, type });
      return;
    }

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    if (type !== "all") {
      params.set("type", type);
    }

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      className={`knowledge-search knowledge-search--${variant} ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="knowledge-search__input-wrap">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          value={activeQuery}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      <select
        value={type}
        onChange={(event) => setType(event.target.value)}
        aria-label="Choose search type"
      >
        {SEARCH_TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button type="submit">
        Search
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </form>
  );
}
