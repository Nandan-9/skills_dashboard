"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchStudents } from "@/lib/api";
import type { Student } from "@/types/student";
import StudentsTable from "@/components/StudentsTable";
import UpdateDataButton from "@/components/UpdateDataButton";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <main className="h-screen w-screen p-6 flex flex-col bg-white text-gray-900">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-xl font-semibold">Student Applications</h1>
        <UpdateDataButton onSuccess={loadStudents} />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="flex-1 min-h-0">
          <StudentsTable students={students} />
        </div>
      )}
    </main>
  );
}
