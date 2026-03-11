import { KnowledgeCard, type KnowledgeCardItem } from "@/components/cards/KnowledgeCard";

type CardGridProps = {
  cards: KnowledgeCardItem[];
  onToggleFavorite?: (cardId: string, next: boolean) => void;
  onToggleStar?: (cardId: string, next: boolean) => void;
};

export function CardGrid({ cards, onToggleFavorite, onToggleStar }: CardGridProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {cards.map((card) => (
        <div key={card.id} className="mb-4 break-inside-avoid">
          <KnowledgeCard
            card={card}
            onToggleFavorite={onToggleFavorite}
            onToggleStar={onToggleStar}
          />
        </div>
      ))}
    </div>
  );
}
