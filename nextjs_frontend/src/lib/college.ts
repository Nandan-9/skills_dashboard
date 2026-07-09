import type { CollegeGroup } from "@/types/college";

export function getApprovedCount(college: CollegeGroup): number {
  return college.students.filter((student) => student.approval_status === "approve").length;
}
