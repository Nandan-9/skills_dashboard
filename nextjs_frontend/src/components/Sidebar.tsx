"use client";

export type DashboardView = "all" | "advanced";

const NAV_ITEMS: { key: DashboardView; label: string }[] = [
  { key: "all", label: "All Data" },
  { key: "advanced", label: "Advanced Filters" },
];

export default function Sidebar({
  view,
  onChange,
}: {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}) {
  return (
    <aside className="w-56 shrink-0 h-screen border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="px-4 py-5 text-lg font-semibold">Shawshank.</div>
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
              view === item.key
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
