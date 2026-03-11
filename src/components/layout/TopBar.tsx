"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";

export function TopBar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-cream">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-card border border-card-border bg-card lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-text-primary" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div className="relative flex-1 lg:max-w-2xl">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-secondary">
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search cards..."
            className="h-11 w-full rounded-card border border-card-border bg-card pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          type="button"
          aria-label="Create new"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-lg font-bold text-white transition-colors hover:bg-accent-hover sm:h-10 sm:w-10 sm:text-xl"
        >
          +
        </button>
      </div>
    </header>
  );
}
