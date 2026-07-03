import type { Student } from "@/types/student";

const COLUMNS: { key: keyof Student; label: string }[] = [
  { key: "full_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone" },
  { key: "state", label: "State" },
  { key: "college_name", label: "College" },
  { key: "degree_program", label: "Degree Program" },
  { key: "year_of_study", label: "Year" },
  { key: "awareness_score", label: "Awareness Score" },
  { key: "submitted_at", label: "Submitted" },
];

export default function StudentsTable({ students }: { students: Student[] }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-2 font-medium whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.reference_id} className="even:bg-gray-50 dark:even:bg-gray-900">
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                  {String(student[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
