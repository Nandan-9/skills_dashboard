"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStudents } from "@/lib/api";
import type { Student } from "@/types/student";
import StudentsTable from "@/components/StudentsTable";
import Sidebar from "@/components/Sidebar";
import { applyFilters, EMPTY_FILTERS, type Filters } from "@/components/filters/types";

export default function ApprovedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const approvedStudents = useMemo(
    () => students.filter((student) => student.approval_status === "approve"),
    [students]
  );

  const filteredStudents = useMemo(
    () => applyFilters(approvedStudents, filters),
    [approvedStudents, filters]
  );

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      setStudents(await fetchStudents());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Approved Students</h1>
          <p className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {approvedStudents.length} approved
          </p>
        </div>
        <div className="mb-4 shrink-0">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            placeholder="Search by name, email, college, or reference ID..."
            className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="flex-1 min-h-0">
            <StudentsTable students={filteredStudents} />
          </div>
        )}
      </main>
    </div>
  );
}
