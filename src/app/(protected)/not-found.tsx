import Link from "next/link";

export default function ProtectedNotFound() {
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
            <path d="M3 12h18M12 3v18" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-text-primary">Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          The page you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-card bg-accent px-4 py-2 font-semibold text-white"
        >
          Go back home
        </Link>
      </section>
    </main>
  );
}
