"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-card bg-card p-10 text-center shadow-card">
        <h1 className="font-display text-5xl text-text-primary">AI Tutor</h1>
        <p className="mt-4 text-text-secondary">Signed in as: {user?.email ?? "-"}</p>
        <Button className="mt-8" onClick={signOut}>
          Log Out
        </Button>
      </section>
    </main>
  );
}
