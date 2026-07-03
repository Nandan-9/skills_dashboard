"use client";

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="px-4 py-5 text-lg font-semibold">Shawshank.</div>
      <nav className="flex flex-col gap-1 px-2">
        <div className="text-left px-3 py-2 rounded text-sm font-medium bg-blue-600 text-white">
          All Data
        </div>
      </nav>
    </aside>
  );
}
