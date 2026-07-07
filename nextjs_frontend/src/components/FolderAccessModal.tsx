"use client";

import { useEffect, useState } from "react";
import { fetchFolderAccess, grantFolderAccess } from "@/lib/api";
import { FOLDER_ACCESS_ROLES, type Folder, type FolderAccessEntry, type FolderAccessRole } from "@/types/folder";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FolderAccessModalProps {
  folder: Folder;
  onClose: () => void;
}

export default function FolderAccessModal({ folder, onClose }: FolderAccessModalProps) {
  const folderId = folder.drive_folder_id;
  const folderName = folder.student_id;
  const [entries, setEntries] = useState<FolderAccessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<FolderAccessRole>("reader");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = () => {
    setLoading(true);
    setError(null);
    fetchFolderAccess(folderId)
      .then(setEntries)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setSubmitting(true);
    setError(null);
    try {
      const created = await grantFolderAccess(folderId, trimmedEmail, role);
      setEntries((current) => [...current, created]);
      setEmail("");
      setRole("reader");
      setShowAddForm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Manage access</h2>
            <p className="text-xs text-gray-500 truncate max-w-xs" title={folderName}>
              {folderName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-80 overflow-auto">
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && entries.length === 0 && (
            <p className="text-sm text-gray-500">No one has access yet.</p>
          )}

          {!loading && entries.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate mr-2" title={entry.emailAddress}>
                    {entry.emailAddress}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-gray-500 capitalize bg-gray-100 rounded px-2 py-0.5">
                    {entry.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 px-5 py-3">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
              Add person
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Email address"
                  autoFocus
                  className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as FolderAccessRole)}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {FOLDER_ACCESS_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {emailError && <p className="text-xs text-red-600">{emailError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEmail("");
                    setEmailError(null);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
