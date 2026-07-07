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

  useEffect(() => {
    fetchFolders()
      .then(setFolders)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen w-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-semibold">Folders</h1>
          <p className="text-sm text-gray-500">{folders.length} folder(s) created</p>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="flex-1 min-h-0 overflow-auto">
            <ul className="divide-y divide-gray-100">
              {folders.map((folder) => (
                <li key={folder.drive_folder_id}>
                  <a
                    href={folder.folder_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded"
                  >
                    <FolderIcon className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-sm font-medium">{folder.student_id}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
