export interface Student {
  reference_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  state: string;
  college_name: string;
  degree_program: string;
  year_of_study: string;
  awareness_score: number;
  submitted_at: string;
}

export interface SyncSummary {
  created: number;
  updated: number;
  errors: unknown[];
}
