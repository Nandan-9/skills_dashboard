export interface BulkUploadResult {
  filename: string;
  reference_id: string;
  error?: string;
  folder_id?: string;
  file_id?: string;
  webViewLink?: string;
  overwritten?: boolean;
}

export interface BulkUploadResponse {
  results: BulkUploadResult[];
}

export interface StudentFolder {
  student_id: string;
  drive_folder_id: string;
  folder_link: string;
  created_at: string;
}

export interface StudentFolderListResponse {
  results: StudentFolder[];
}

export type FolderAccessRole = "reader" | "writer" | "commenter" | "owner";

export interface FolderAccessEntry {
  id: string;
  emailAddress: string;
  role: FolderAccessRole;
  type: string;
}
