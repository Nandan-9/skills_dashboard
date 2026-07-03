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

export const YEAR_LABELS: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
  "5": "5th Year / Final",
};

export const GENDER_LABELS: Record<string, string> = {
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
