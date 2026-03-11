import Link from "next/link";
import { ExplainChat } from "@/components/explain/ExplainChat";

export default function ExplainPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-card-border bg-card"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18 9 12l6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-3xl text-text-primary">AI Explain</h1>
        </header>

        <ExplainChat />
      </div>
    </main>
  );
}
