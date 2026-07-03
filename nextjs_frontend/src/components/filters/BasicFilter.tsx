"use client";

import type { Filters } from "./types";

export default function BasicFilter({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Search name, email, college..."
      value={filters.search}
      onChange={(e) => onChange({ ...filters, search: e.target.value })}
      className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-900 min-w-[240px]"
    />
  );
}
