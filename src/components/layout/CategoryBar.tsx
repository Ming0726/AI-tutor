"use client";

import { useCategories } from "@/hooks/useCategories";
import { useUIStore } from "@/stores/uiStore";

export function CategoryBar() {
  const { categories, loading } = useCategories();
  const selectedCategoryId = useUIStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useUIStore((state) => state.setSelectedCategoryId);

  return (
    <div className="overflow-x-auto scrollbar-hide px-4 py-3">
      <div className="mx-auto flex w-max min-w-full max-w-6xl gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategoryId(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${selectedCategoryId === null ? "bg-accent text-white" : "border border-card-border bg-card text-text-secondary"}`}
        >
          All
        </button>

        {!loading &&
          categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(category.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${selectedCategoryId === category.id ? "bg-accent text-white" : "border border-card-border bg-card text-text-secondary"}`}
            >
              {category.name}
            </button>
          ))}
      </div>
    </div>
  );
}
