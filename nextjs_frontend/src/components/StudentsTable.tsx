import type { Student } from "@/types/student";

const COLUMNS: { key: keyof Student; label: string }[] = [
  { key: "reference_id", label: "Reference ID" },

  { key: "full_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "photo_url", label: "Photo" },

  { key: "official_email", label: "Official Email" },
  { key: "state", label: "State" },
  { key: "college_name", label: "College" },
  { key: "is_state_verified", label: "State Verified" },
  { key: "degree_program", label: "Degree Program" },
  { key: "year_of_study", label: "Year" },
  { key: "is_women_only_institution", label: "Women-only Institution" },
  { key: "student_strength", label: "Student Strength" },

  { key: "awareness_score", label: "Awareness Score" },
  { key: "active_participants_estimate", label: "Active Participants Est." },
  { key: "institution_has", label: "Institution Has" },
  { key: "non_participation_reasons", label: "Non-participation Reasons" },
  { key: "biggest_challenge", label: "Biggest Challenge" },
  { key: "awareness_plan", label: "Awareness Plan" },
  { key: "estimated_teams", label: "Estimated Teams" },

  { key: "memberships", label: "Memberships" },
  { key: "has_organized_event", label: "Organized Event" },
  { key: "event_description", label: "Event Description" },
  { key: "network_reach_estimate", label: "Network Reach Est." },
  { key: "aware_of_mentors", label: "Aware of Mentors" },
  { key: "mentor_details", label: "Mentor Details" },
  { key: "faculty_encourages", label: "Faculty Encourages" },
  { key: "motivation", label: "Motivation" },
  { key: "agrees_to_promote", label: "Agrees to Promote" },

  { key: "instagram_url", label: "Instagram" },
  { key: "linkedin_url", label: "LinkedIn" },
];

const URL_KEYS = new Set<keyof Student>(["photo_url", "instagram_url", "linkedin_url"]);

function formatCell(student: Student, key: keyof Student) {
  const value = student[key];

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  if (URL_KEYS.has(key)) {
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Link
      </a>
    );
  }

  return String(value);
}

export default function StudentsTable({ students }: { students: Student[] }) {
  return (
    <div className="overflow-auto border border-gray-200 rounded h-full bg-white">
      <table className="w-full text-sm text-left text-gray-900">
        <thead className="sticky top-0 bg-gray-100">
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
            <tr key={student.reference_id} className="even:bg-gray-50">
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-3 py-2 whitespace-nowrap max-w-xs truncate">
                  {formatCell(student, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
