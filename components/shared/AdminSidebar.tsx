"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminNavItem {
  name: string;
  href: string;
  icon: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    name: "Models",
    href: "/admin/models",
    icon: "model_training",
  },
  {
    name: "Prompts",
    href: "/admin/prompts",
    icon: "description",
  },
  {
    name: "Prompt Injects",
    href: "/admin/prompt-injects",
    icon: "integration_instructions",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: "people",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`bg-white border-r border-gray-200 h-full transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Add Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <div className="flex justify-between items-center p-4 border-b">
        {!collapsed && <h2 className="font-semibold text-lg">Admin Panel</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <span 
                  className="material-icons text-xl mr-3"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
