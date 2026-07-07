export interface Folder {
  student_id: string;
  drive_folder_id: string;
  folder_link: string;
  created_at: string;
}

export interface FolderListResponse {
  results: Folder[];
}

export const FOLDER_ACCESS_ROLES = ["reader", "commenter", "writer", "owner"] as const;

export type FolderAccessRole = (typeof FOLDER_ACCESS_ROLES)[number];

export interface FolderAccessEntry {
  id: string;
  emailAddress: string;
  role: FolderAccessRole;
  type: string;
}
