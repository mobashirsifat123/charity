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
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState(defaultType);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
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
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
