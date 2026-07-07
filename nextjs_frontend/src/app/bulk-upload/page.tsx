"use client";

import { useState } from "react";
import { uploadBulkFiles } from "@/lib/api";
import type { BulkUploadResult } from "@/types/upload";
import Sidebar from "@/components/Sidebar";

export default function BulkUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkUploadResult[] | null>(null);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const response = await uploadBulkFiles(files);
      setResults(response.results);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Bulk Upload</h1>
          <p className="text-sm text-gray-500">
            File names must be the student&apos;s reference_id, e.g. &quot;123.png&quot;
          </p>
        </div>

        <div className="border border-gray-200 rounded p-4 shrink-0 flex items-center gap-3">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {uploading ? "Uploading..." : `Upload ${files.length || ""}`.trim()}
          </button>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {results && (
          <div className="flex-1 min-h-0 overflow-auto mt-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 pr-4">Filename</th>
                  <th className="py-2 pr-4">Reference ID</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.filename} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{result.filename}</td>
                    <td className="py-2 pr-4">{result.reference_id}</td>
                    <td className="py-2 pr-4">
                      {result.error ? (
                        <span className="text-red-600">{result.error}</span>
                      ) : (
                        <span className="text-green-700">
                          {result.overwritten ? "Overwritten" : "Uploaded"}
                        </span>
                      )}
                    </td>
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
