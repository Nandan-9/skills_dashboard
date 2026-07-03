"use client";

import { useMemo } from "react";
import type { Student } from "@/types/student";

export interface Filters {
  search: string;
  state: string;
  gender: string;
  yearOfStudy: string;
  isWomenOnlyInstitution: string;
  hasOrganizedEvent: string;
  agreesToPromote: string;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  state: "",
  gender: "",
  yearOfStudy: "",
  isWomenOnlyInstitution: "",
  hasOrganizedEvent: "",
  agreesToPromote: "",
};

const YEAR_LABELS: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
  "5": "5th Year / Final",
};

const GENDER_LABELS: Record<string, string> = {
  M: "Male",
  F: "Female",
  O: "Other",
};

function boolMatches(value: boolean | null | undefined, filter: string) {
  if (!filter) return true;
  if (filter === "yes") return value === true;
  if (filter === "no") return value === false;
  return true;
}

export function applyFilters(students: Student[], filters: Filters): Student[] {
  const search = filters.search.trim().toLowerCase();

  return students.filter((s) => {
    if (search) {
      const haystack = `${s.full_name} ${s.email} ${s.official_email} ${s.college_name} ${s.reference_id}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.state && s.state !== filters.state) return false;
    if (filters.gender && s.gender !== filters.gender) return false;
    if (filters.yearOfStudy && s.year_of_study !== filters.yearOfStudy) return false;
    if (!boolMatches(s.is_women_only_institution, filters.isWomenOnlyInstitution)) return false;
    if (!boolMatches(s.has_organized_event, filters.hasOrganizedEvent)) return false;
    if (!boolMatches(s.agrees_to_promote, filters.agreesToPromote)) return false;
    return true;
  });
}

const selectClass =
  "px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-900";

export default function StudentFilters({
  students,
  filters,
  onChange,
}: {
  students: Student[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  const states = useMemo(
    () => Array.from(new Set(students.map((s) => s.state).filter(Boolean))).sort(),
    [students],
  );

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
      <input
        type="text"
        placeholder="Search name, email, college..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-900 min-w-[220px]"
      />

      <select
        value={filters.state}
        onChange={(e) => set("state", e.target.value)}
        className={selectClass}
      >
        <option value="">All States</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        value={filters.gender}
        onChange={(e) => set("gender", e.target.value)}
        className={selectClass}
      >
        <option value="">All Genders</option>
        {Object.entries(GENDER_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.yearOfStudy}
        onChange={(e) => set("yearOfStudy", e.target.value)}
        className={selectClass}
      >
        <option value="">All Years</option>
        {Object.entries(YEAR_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.isWomenOnlyInstitution}
        onChange={(e) => set("isWomenOnlyInstitution", e.target.value)}
        className={selectClass}
      >
        <option value="">Women-only Institution: Any</option>
        <option value="yes">Women-only Institution: Yes</option>
        <option value="no">Women-only Institution: No</option>
      </select>

      <select
        value={filters.hasOrganizedEvent}
        onChange={(e) => set("hasOrganizedEvent", e.target.value)}
        className={selectClass}
      >
        <option value="">Organized Event: Any</option>
        <option value="yes">Organized Event: Yes</option>
        <option value="no">Organized Event: No</option>
      </select>

      <select
        value={filters.agreesToPromote}
        onChange={(e) => set("agreesToPromote", e.target.value)}
        className={selectClass}
      >
        <option value="">Agrees to Promote: Any</option>
        <option value="yes">Agrees to Promote: Yes</option>
        <option value="no">Agrees to Promote: No</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
