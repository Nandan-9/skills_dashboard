import type { ApprovalStatus, Student } from "@/types/student";
import type { CollegeStudentsResponse } from "@/types/college";
import type { BulkUploadResponse, FolderAccessEntry, FolderAccessRole, StudentFolder } from "@/types/upload";

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

export async function uploadBulkFiles(files: File[]): Promise<BulkUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch("/api/filehandler/bulk-upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload files");
  return res.json();
}

export async function fetchFolders(): Promise<StudentFolder[]> {
  const res = await fetch("/api/filehandler/folders", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load folders");
  const data = await res.json();
  return data.results;
}

export async function fetchFolderAccess(folderId: string): Promise<FolderAccessEntry[]> {
  const res = await fetch(`/api/filehandler/folder-access?folder_id=${encodeURIComponent(folderId)}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Failed to load folder access");
  return data;
}

export async function grantFolderAccess(
  folderId: string,
  email: string,
  role: FolderAccessRole
): Promise<FolderAccessEntry> {
  const res = await fetch("/api/filehandler/folder-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder_id: folderId, email, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Failed to grant folder access");
  return data;
}
