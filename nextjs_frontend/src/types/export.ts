export interface ExportRow {
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  state: string;
  college: string;
  approve: string;
  drive_folder_link: string | null;
}

export interface ExportDataResponse {
  results: ExportRow[];
}
