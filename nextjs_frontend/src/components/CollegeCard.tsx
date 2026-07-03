import type { CollegeGroup } from "@/types/college";
import StudentsTable from "@/components/StudentsTable";

export default function CollegeCard({ college }: { college: CollegeGroup }) {
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">{college.college_name || "—"}</h2>
          {college.state && <p className="text-xs text-gray-500">{college.state}</p>}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {college.student_count} student{college.student_count === 1 ? "" : "s"}
        </span>
      </div>
      <StudentsTable students={college.students} maxHeight="24rem" />
    </div>
  );
}
