"use client";

import { useEffect, useState } from "react";
import { fetchFolders } from "@/lib/api";
import type { StudentFolder } from "@/types/upload";
import Sidebar from "@/components/Sidebar";
import { FolderIcon } from "@/components/icons/FolderIcon";

export default function FoldersPage() {
  const [folders, setFolders] = useState<StudentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFolders()
      .then(setFolders)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filteredFolders = folders.filter((folder) =>
    folder.student_id.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Folders</h1>
          <p className="text-sm text-gray-500">{folders.length} folder(s) created</p>
        </div>

        <div className="mb-4 shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference ID..."
            className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && filteredFolders.length === 0 && (
          <p className="text-sm text-gray-500">No folders match your search.</p>
        )}

        {!loading && !error && filteredFolders.length > 0 && (
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredFolders.map((folder) => (
                <a
                  key={folder.drive_folder_id}
                  href={folder.folder_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square flex flex-col items-center justify-center gap-2 p-4 rounded hover:bg-gray-50"
                >
                  <FolderIcon className="w-10 h-10 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-center truncate w-full" title={folder.student_id}>
                    {folder.student_id}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
