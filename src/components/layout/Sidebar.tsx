"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";

const navItems = [
  { href: "/", label: "Home", icon: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/explain", label: "Explain", icon: "M12 4v16M4 12h16" },
  { href: "/quiz", label: "Quiz", icon: "M7 4h10v16H7zM9 8h6M9 12h6M9 16h4" },
  { href: "/cards", label: "Cards", icon: "M4 7h16v10H4zM8 7v10" },
  { href: "/documents", label: "Documents", icon: "M7 3h7l4 4v14H7zM14 3v4h4" },
  { href: "/settings", label: "Settings", icon: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0-5 1.2 2.3 2.6.4-.9 2.4 1.9 1.8-1.9 1.8.9 2.4-2.6.4L12 21l-1.2-2.3-2.6-.4.9-2.4-1.9-1.8 1.9-1.8-.9-2.4 2.6-.4z" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/25 transition-opacity lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-card-border bg-card px-5 py-6 shadow-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-accent-light" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">
              {(user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "User"}
            </p>
            <p className="truncate text-sm text-text-secondary">{user?.email ?? "-"}</p>
          </div>
        </div>

        <div className="my-5 h-px bg-card-border" />

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-card px-3 py-2 text-sm font-semibold ${active ? "bg-accent text-white" : "text-text-primary hover:bg-accent-light"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={async () => {
            setSidebarOpen(false);
            await signOut();
          }}
          className="mt-4 rounded-card bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-hover"
        >
          Log Out
        </button>
      </aside>
    </>
  );
}
