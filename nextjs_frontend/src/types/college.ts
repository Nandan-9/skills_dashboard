import type { Student } from "@/types/student";

export interface CollegeGroup {
  college_name: string;
  state: string;
  student_count: number;
  students: Student[];
}

export interface CollegeStudentsResponse {
  total_colleges: number;
  total_students: number;
  colleges: CollegeGroup[];
}
