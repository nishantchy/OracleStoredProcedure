"use client";
import React from "react";
import { SIDEBAR_LINKS } from "../constants/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="sidebar bg-white shadow-md rounded-lg p-6 w-56 min-h-screen">
      <h2 className="text-xl font-bold mb-8 text-gray-800 text-center tracking-wide">
        Menu
      </h2>
      <ul className="space-y-2">
        {SIDEBAR_LINKS.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              className={`block px-4 py-2 rounded transition-colors font-medium text-gray-700 hover:bg-teal-100 hover:text-teal-700 ${
                pathname === link.path ? "bg-teal-500 text-white" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
