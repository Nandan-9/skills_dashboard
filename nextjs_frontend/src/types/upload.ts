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
