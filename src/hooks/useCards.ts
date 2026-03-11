"use client";

import { useCallback, useEffect, useState } from "react";
import type { KnowledgeCardItem } from "@/components/cards/KnowledgeCard";
import { useToastStore } from "@/stores/toastStore";

type UseCardsParams = {
  categoryId?: string | null;
  searchQuery?: string;
};

type CardsResponseRow = {
  id: string;
  title: string;
  summary: string;
  content: string;
  illustration_url: string | null;
  is_favorited: boolean | null;
  is_starred: boolean | null;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
};

export function useCards({ categoryId, searchQuery }: UseCardsParams) {
  const showToast = useToastStore((state) => state.showToast);
  const [cards, setCards] = useState<KnowledgeCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (categoryId) params.set("categoryId", categoryId);
      const q = searchQuery?.trim();
      if (q) params.set("search", q);

      const response = await fetch(`/api/cards?${params.toString()}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Failed to load cards");
        showToast({ message: body?.error ?? "Failed to load cards", type: "error" });
        setCards([]);
        setLoading(false);
        return;
      }

      const payload = await response.json();

      const mapped = ((payload.cards ?? []) as CardsResponseRow[]).map((row) => {
        const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
        return {
          id: row.id,
          title: row.title,
          summary: row.summary,
          content: row.content,
          illustration_url: row.illustration_url,
          is_favorited: Boolean(row.is_favorited),
          is_starred: Boolean(row.is_starred),
          category_name: category?.name ?? null,
          created_at: row.created_at,
        };
      });

      setCards(mapped);
      setError(null);
      setLoading(false);
    } catch {
      setError("Network error, please try again");
      showToast({ message: "Network error, please try again", type: "error" });
      setCards([]);
      setLoading(false);
    }
  }, [categoryId, searchQuery, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCards();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCards]);

  const patchCard = useCallback(async (cardId: string, updates: { is_favorited?: boolean; is_starred?: boolean }) => {
    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Update failed");
    }
  }, []);

  const toggleFavorite = useCallback(
    async (cardId: string, next: boolean) => {
      const previous = cards;
      setCards((current) =>
        current.map((card) => (card.id === cardId ? { ...card, is_favorited: next } : card)),
      );

      try {
        await patchCard(cardId, { is_favorited: next });
      } catch (err) {
        setCards(previous);
        showToast({
          message: err instanceof Error ? err.message : "Failed to update favorite",
          type: "error",
        });
      }
    },
    [cards, patchCard, showToast],
  );

  const toggleStar = useCallback(
    async (cardId: string, next: boolean) => {
      const previous = cards;
      setCards((current) =>
        current.map((card) => (card.id === cardId ? { ...card, is_starred: next } : card)),
      );

      try {
        await patchCard(cardId, { is_starred: next });
      } catch (err) {
        setCards(previous);
        showToast({
          message: err instanceof Error ? err.message : "Failed to update star",
          type: "error",
        });
      }
    },
    [cards, patchCard, showToast],
  );

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
    toggleFavorite,
    toggleStar,
  };
}
