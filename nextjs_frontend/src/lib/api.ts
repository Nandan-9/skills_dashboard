import type { ApprovalStatus, Student } from "@/types/student";
import type { CollegeStudentsResponse } from "@/types/college";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch("/api/sync", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load students");
  return res.json();
}

export async function syncAndFilter(): Promise<Student[]> {
  const res = await fetch("/api/sync", { method: "POST" });
  if (!res.ok) throw new Error("Failed to sync data");
  return res.json();
}

export async function fetchCollegeStudents(): Promise<CollegeStudentsResponse> {
  const res = await fetch("/api/colleges/students", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load colleges");
  return res.json();
}

export async function setApprovalStatus(id: number, approval_status: ApprovalStatus): Promise<Student> {
  const res = await fetch(`/api/applications/${id}/approval`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approval_status }),
  });
  if (!res.ok) throw new Error("Failed to update approval status");
  return res.json();
}
