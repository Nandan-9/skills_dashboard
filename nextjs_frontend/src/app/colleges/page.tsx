"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCollegeStudents } from "@/lib/api";
import { getApprovedCount } from "@/lib/college";
import type { CollegeStudentsResponse } from "@/types/college";
import CollegeCard from "@/components/CollegeCard";
import Sidebar from "@/components/Sidebar";

export default function CollegesPage() {
  const [data, setData] = useState<CollegeStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countFilter, setCountFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");

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
        <div className="flex flex-wrap items-center gap-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="college-name-filter" className="text-sm text-gray-600">
              College name:
            </label>
            <input
              id="college-name-filter"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="e.g. IIT"
              className="w-48 border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="approved-count-filter" className="text-sm text-gray-600">
              Approved count:
            </label>
            <input
              id="approved-count-filter"
              type="number"
              min={0}
              value={countFilter}
              onChange={(e) => setCountFilter(e.target.value)}
              placeholder="e.g. 5"
              className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-sm text-gray-600">
              Sort by student count:
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "none" | "asc" | "desc")}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="none">None</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          {(countFilter !== "" || nameFilter !== "" || sortOrder !== "none") && (
            <button
              type="button"
              onClick={() => {
                setCountFilter("");
                setNameFilter("");
                setSortOrder("none");
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data && (
          <div className="flex flex-col gap-6">
            {data.colleges
              .filter((college) =>
                countFilter === "" ? true : getApprovedCount(college) === Number(countFilter)
              )
              .filter((college) =>
                nameFilter === ""
                  ? true
                  : (college.college_name || "")
                      .toLowerCase()
                      .includes(nameFilter.toLowerCase())
              )
              .sort((a, b) => {
                if (sortOrder === "asc") return a.student_count - b.student_count;
                if (sortOrder === "desc") return b.student_count - a.student_count;
                return 0;
              })
              .map((college) => (
                <CollegeCard key={college.college_name} college={college} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
