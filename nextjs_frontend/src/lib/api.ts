import type { Student, SyncSummary } from "@/types/student";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch("/api/students", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load students");
  return res.json();
}

export async function syncSheetData(): Promise<SyncSummary> {
  const res = await fetch("/api/update-data", { method: "POST" });
  if (!res.ok) throw new Error("Failed to sync data");
  return res.json();
}
