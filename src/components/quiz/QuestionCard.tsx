"use client";

import type { Question, QuizResultItem } from "@/types/quiz";

type QuestionCardProps = {
  question: Question;
  index: number;
  selectedIndex?: number;
  onSelect?: (optionIndex: number) => void;
  result?: QuizResultItem;
};

export function QuestionCard({ question, index, selectedIndex, onSelect, result }: QuestionCardProps) {
  const isResultMode = Boolean(result);

  return (
    <article className="mb-4 rounded-card bg-card p-5 shadow-card">
      <h3 className="text-base font-bold text-text-primary">
        Q{index}. {question.question}
      </h3>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => {
          const selected = selectedIndex === optionIndex;
          const isCorrect = result?.correctIndex === optionIndex;
          const isWrongSelected = Boolean(result && selected && !result.isCorrect);

          const stateClass = isResultMode
            ? isCorrect
              ? "border-success bg-success/10"
              : isWrongSelected
                ? "border-error bg-error/10"
                : "border-card-border bg-white"
            : selected
              ? "border-accent bg-accent/10"
              : "border-card-border bg-white";

          return (
            <button
              key={`${question.id}-${optionIndex}`}
              type="button"
              disabled={isResultMode}
              onClick={() => onSelect?.(optionIndex)}
              className={`flex w-full items-center justify-between rounded-card border px-4 py-3 text-left text-sm text-text-primary ${stateClass}`}
            >
              <span>{option}</span>
              {isResultMode && isCorrect ? <span className="text-success">✓</span> : null}
              {isResultMode && isWrongSelected ? <span className="text-error">✗</span> : null}
            </button>
          );
        })}
      </div>

      {result ? <p className="mt-3 text-sm text-text-secondary">Explanation: {result.explanation}</p> : null}
    </article>
  );
}
