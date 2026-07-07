"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderIcon } from "@/components/icons/FolderIcon";

const NAV_ITEMS = [
  { href: "/", label: "All Data" },
  { href: "/colleges", label: "Colleges" },
  { href: "/approved", label: "Approved Students" },
  { href: "/bulk-upload", label: "Bulk Upload" },
  { href: "/folders", label: "Folders", icon: FolderIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="px-4 py-5 text-lg font-semibold">Shawshank.</div>
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-left px-3 py-2 rounded text-sm font-medium ${
                active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
