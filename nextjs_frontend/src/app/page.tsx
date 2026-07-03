"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStudents } from "@/lib/api";
import type { Student } from "@/types/student";
import StudentsTable from "@/components/StudentsTable";
import SyncButton from "@/components/SyncButton";
import Sidebar, { type DashboardView } from "@/components/Sidebar";
import BasicFilter from "@/components/filters/BasicFilter";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import { applyFilters, EMPTY_FILTERS, type Filters } from "@/components/filters/types";

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const filteredStudents = useMemo(() => applyFilters(students, filters), [students, filters]);

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
      <Sidebar view={view} onChange={setView} />
      <main className="flex-1 min-w-0 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">
            {view === "all" ? "All Data" : "Advanced Filters"}
          </h1>
          <div className="flex items-center gap-3">
            {view === "all" && <BasicFilter filters={filters} onChange={setFilters} />}
            <SyncButton onSuccess={setStudents} />
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            {view === "advanced" && (
              <AdvancedFilters students={students} filters={filters} onChange={setFilters} />
            )}
            <p className="text-sm text-gray-500 mb-2 shrink-0">
              Showing {filteredStudents.length} of {students.length}
            </p>
            <div className="flex-1 min-h-0">
              <StudentsTable students={filteredStudents} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
