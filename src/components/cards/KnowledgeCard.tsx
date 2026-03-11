"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CardIllustration } from "@/components/cards/CardIllustration";
import { FavoriteButton } from "@/components/cards/FavoriteButton";

export type KnowledgeCardItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  illustration_url: string | null;
  is_favorited: boolean;
  is_starred: boolean;
  category_name: string | null;
  created_at: string;
};

type KnowledgeCardProps = {
  card: KnowledgeCardItem;
  onToggleFavorite?: (cardId: string, next: boolean) => void;
  onToggleStar?: (cardId: string, next: boolean) => void;
};

export function KnowledgeCard({ card, onToggleFavorite, onToggleStar }: KnowledgeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const createdAt = useMemo(() => {
    const date = new Date(card.created_at);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  }, [card.created_at]);

  return (
    <article className="overflow-hidden rounded-card bg-card shadow-card transition-shadow hover:shadow-lg">
      <div className="relative">
        <CardIllustration url={card.illustration_url} alt={card.title} />
        {card.category_name ? (
          <span className="absolute right-3 top-3 rounded-full bg-accent/80 px-2 py-0.5 text-xs text-white">
            {card.category_name}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-bold text-text-primary">{card.title}</h3>

        {!expanded ? <p className="line-clamp-3 text-sm text-text-secondary">{card.summary}</p> : null}

        <div className={`grid transition-all ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="prose prose-sm max-w-none text-text-primary">
              <ReactMarkdown>{card.content}</ReactMarkdown>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {createdAt ? `Created: ${createdAt}` : ""}
              {card.category_name ? ` • ${card.category_name}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {expanded ? "Show less ▴" : "Read more ▾"}
        </button>

        <div className="flex items-center gap-2">
          <FavoriteButton
            active={card.is_favorited}
            icon="heart"
            onClick={() => onToggleFavorite?.(card.id, !card.is_favorited)}
          />
          <FavoriteButton
            active={card.is_starred}
            icon="star"
            onClick={() => onToggleStar?.(card.id, !card.is_starred)}
          />
        </div>
      </div>
    </article>
  );
}
