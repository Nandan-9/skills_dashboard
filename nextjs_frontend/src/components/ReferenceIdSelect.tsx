"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Student } from "@/types/student";

interface ReferenceIdSelectProps {
  students: Student[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ReferenceIdSelect({
  students,
  selectedIds,
  onChange,
}: ReferenceIdSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.reference_id.toLowerCase().includes(q) || s.full_name?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedSet.has(s.reference_id));

  const toggleOne = (referenceId: string) => {
    if (selectedSet.has(referenceId)) {
      onChange(selectedIds.filter((id) => id !== referenceId));
    } else {
      onChange([...selectedIds, referenceId]);
    }
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredStudents.map((s) => s.reference_id);
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredIds);
      onChange(selectedIds.filter((id) => !filteredIdSet.has(id)));
    } else {
      onChange(Array.from(new Set([...selectedIds, ...filteredIds])));
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded px-2 py-1 text-sm text-left bg-white"
      >
        <span className={selectedIds.length === 0 ? "text-gray-400" : "text-gray-900"}>
          {selectedIds.length === 0
            ? "Select reference IDs..."
            : `${selectedIds.length} reference ID${selectedIds.length === 1 ? "" : "s"} selected`}
        </span>
        <span className="text-gray-400 ml-2">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg flex flex-col max-h-72">
          <div className="p-2 border-b border-gray-100 shrink-0">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference ID or name..."
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 text-sm font-medium text-gray-700 cursor-pointer shrink-0 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="shrink-0"
            />
            Select all{search ? " (filtered)" : ""}
          </label>
          <div className="overflow-y-auto">
            {filteredStudents.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No students found</p>
            )}
            {filteredStudents.map((student) => (
              <label
                key={student.reference_id}
                className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(student.reference_id)}
                  onChange={() => toggleOne(student.reference_id)}
                  className="shrink-0"
                />
                <span className="font-medium">{student.reference_id}</span>
                {student.full_name && (
                  <span className="text-gray-500 truncate">{student.full_name}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
