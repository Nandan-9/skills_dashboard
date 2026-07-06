"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStudents } from "@/lib/api";
import type { Student } from "@/types/student";
import StudentsTable from "@/components/StudentsTable";
import Sidebar from "@/components/Sidebar";

export default function ApprovedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const approvedStudents = useMemo(
    () => students.filter((student) => student.approval_status === "approve"),
    [students]
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
          <p className="text-sm text-gray-500">{approvedStudents.length} approved</p>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="flex-1 min-h-0">
            <StudentsTable students={approvedStudents} />
          </div>
        )}
      </main>
    </div>
  );
}
