"use client";

import { useState } from "react";
import { CardGrid } from "@/components/cards/CardGrid";
import { CreateCardModal } from "@/components/cards/CreateCardModal";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCards } from "@/hooks/useCards";
import { useUIStore } from "@/stores/uiStore";

function GridLoading() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="mb-4 break-inside-avoid rounded-card bg-card p-3 shadow-card">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="mt-3 h-6 w-2/3" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function CardsPage() {
  const [open, setOpen] = useState(false);
  const selectedCategoryId = useUIStore((state) => state.selectedCategoryId);
  const searchQuery = useUIStore((state) => state.searchQuery);

  const { cards, loading, error, refetch, toggleFavorite, toggleStar } = useCards({
    categoryId: selectedCategoryId,
    searchQuery,
  });

  return (
    <main className="min-h-screen bg-cream pb-24">
      <TopBar />
      <CategoryBar />

      <section className="mx-auto max-w-6xl px-4 py-8">
        {error ? <p className="mb-4 text-sm font-semibold text-error">{error}</p> : null}
        {loading ? (
          <GridLoading />
        ) : (
          <CardGrid cards={cards} onToggleFavorite={toggleFavorite} onToggleStar={toggleStar} />
        )}
      </section>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl leading-none text-white shadow-lg hover:bg-accent-hover"
        aria-label="Create card"
      >
        +
      </button>

      <CreateCardModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          void refetch();
        }}
      />
    </main>
  );
}
