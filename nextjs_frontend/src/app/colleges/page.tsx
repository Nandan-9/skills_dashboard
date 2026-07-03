"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCollegeStudents } from "@/lib/api";
import type { CollegeStudentsResponse } from "@/types/college";
import CollegeCard from "@/components/CollegeCard";
import Sidebar from "@/components/Sidebar";

export default function CollegesPage() {
  const [data, setData] = useState<CollegeStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadColleges = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchCollegeStudents());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Colleges</h1>
          {data && (
            <p className="text-sm text-gray-500">
              {data.total_colleges} college{data.total_colleges === 1 ? "" : "s"} &middot;{" "}
              {data.total_students} student{data.total_students === 1 ? "" : "s"}
            </p>
          )}
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data && (
          <div className="flex flex-col gap-6">
            {data.colleges.map((college) => (
              <CollegeCard key={college.college_name} college={college} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
