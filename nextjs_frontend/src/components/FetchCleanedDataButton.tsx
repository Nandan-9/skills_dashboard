"use client";

import { useState } from "react";
import { syncCleanupData } from "@/lib/api";

export default function FetchCleanedDataButton({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await syncCleanupData();
      onSuccess();
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
        className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Fetching..." : "Fetch Cleaned Data"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
