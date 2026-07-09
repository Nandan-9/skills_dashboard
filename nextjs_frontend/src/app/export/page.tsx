"use client";

import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { fetchExportData } from "@/lib/api";
import type { ExportRow } from "@/types/export";
import Sidebar from "@/components/Sidebar";

const COLUMNS: { key: keyof ExportRow; label: string }[] = [
  { key: "reference_id", label: "Reference ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "state", label: "State" },
  { key: "college", label: "College" },
  { key: "approve", label: "Approve" },
  { key: "drive_folder_link", label: "Drive Folder Link" },
];

export default function ExportPage() {
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchExportData());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        "Reference ID": row.reference_id,
        Name: row.name,
        Email: row.email,
        Phone: row.phone,
        Gender: row.gender,
        State: row.state,
        College: row.college,
        Approve: row.approve,
        "Drive Folder Link": row.drive_folder_link,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
    XLSX.writeFile(workbook, "export.xlsx");
  };

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Export</h1>
          <div className="flex items-center gap-4">
            {!loading && !error && (
              <p className="text-sm text-gray-500">{rows.length} row{rows.length === 1 ? "" : "s"}</p>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || !!error || rows.length === 0}
              className="px-3 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-auto border border-gray-200 rounded bg-white h-full">
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
                {rows.map((row) => (
                  <tr key={row.reference_id}>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-3 py-2 whitespace-nowrap max-w-xs truncate">
                        {col.key === "drive_folder_link" && row.drive_folder_link ? (
                          <a
                            href={row.drive_folder_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Open folder
                          </a>
                        ) : (
                          row[col.key] || "—"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
