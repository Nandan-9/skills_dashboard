export interface Student {
  id: number;
  reference_id: string;
  submitted_at: string;
  created_at: string;

  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  photo_url: string | null;

  official_email: string;
  state: string;
  college_name: string;
  is_state_verified: boolean;
  degree_program: string;
  year_of_study: string;
  is_women_only_institution: boolean;
  student_strength: number | null;

  awareness_score: number;
  active_participants_estimate: string;
  institution_has: string[];
  non_participation_reasons: string[];
  biggest_challenge: string;
  awareness_plan: string;
  estimated_teams: number | null;

  memberships: string[];
  has_organized_event: boolean;
  event_description: string;
  network_reach_estimate: number | null;
  aware_of_mentors: boolean;
  mentor_details: string;
  faculty_encourages: boolean | null;
  motivation: string;
  agrees_to_promote: boolean;

  instagram_url: string | null;
  linkedin_url: string | null;

  is_included: boolean;

  approval_status: ApprovalStatus;
}

export type ApprovalStatus = "approve" | "on_hold" | "rejected";

