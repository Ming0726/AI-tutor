"use client";

import { useRouter } from "next/navigation";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <section className="w-full max-w-lg rounded-card bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 h-16 w-16 text-accent">
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5h.01M14.5 9.5h.01M8.5 15c1.2-1 2.3-1.5 3.5-1.5S14.3 14 15.5 15" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-text-primary">Something went wrong</h1>
        <p className="mt-2 text-sm text-text-secondary">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-card bg-accent px-4 py-2 font-semibold text-white"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-card border border-card-border bg-card px-4 py-2 font-semibold text-text-primary"
          >
            Go Home
          </button>
        </div>
      </section>
    </main>
  );
}
