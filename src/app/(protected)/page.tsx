"use client";

import { CardGrid } from "@/components/cards/CardGrid";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCards } from "@/hooks/useCards";
import { useUIStore } from "@/stores/uiStore";

function CardGridSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="mb-4 break-inside-avoid rounded-card bg-card p-3 shadow-card">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-card bg-card p-10 text-center shadow-card">
      <svg viewBox="0 0 64 64" className="h-20 w-20 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h48v30H8z" />
        <path d="M16 22V14h32v8" />
        <path d="M24 34h16" />
      </svg>
      <p className="mt-4 font-display text-2xl text-text-primary">No cards yet. Create your first one!</p>
      <Button className="mt-6">Create Card</Button>
    </div>
  );
}

export default function HomePage() {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedCategoryId = useUIStore((state) => state.selectedCategoryId);
  const { cards, loading, error, toggleFavorite, toggleStar } = useCards({
    categoryId: selectedCategoryId,
    searchQuery,
  });

  return (
    <main className="min-h-screen bg-cream">
      <TopBar />
      <CategoryBar />

      <section className="mx-auto max-w-6xl px-4 py-8">
        {error ? <p className="mb-4 text-sm font-semibold text-error">{error}</p> : null}
        {loading ? (
          <CardGridSkeleton />
        ) : cards.length > 0 ? (
          <CardGrid cards={cards} onToggleFavorite={toggleFavorite} onToggleStar={toggleStar} />
        ) : (
          <EmptyState />
        )}
      </section>

    </main>
  );
}
