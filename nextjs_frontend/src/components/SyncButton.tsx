"use client";

import { useState } from "react";
import { syncAndFilter } from "@/lib/api";
import type { Student } from "@/types/student";

export default function SyncButton({
  onSuccess,
}: {
  onSuccess: (students: Student[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      onSuccess(await syncAndFilter());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync Data"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
