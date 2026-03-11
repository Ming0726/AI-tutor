"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type QuizCount = "5" | "8" | "10";

type QuizFormProps = {
  initialKeyword?: string;
  initialCount?: QuizCount;
  loading?: boolean;
  onGenerate: (payload: { keyword: string; count: QuizCount }) => void | Promise<void>;
};

const counts: QuizCount[] = ["5", "8", "10"];

export function QuizForm({
  initialKeyword = "",
  initialCount = "5",
  loading = false,
  onGenerate,
}: QuizFormProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [count, setCount] = useState<QuizCount>(initialCount);

  return (
    <div className="rounded-card bg-card p-6 shadow-card">
      <Input
        label="Topic"
        placeholder="Enter a topic, e.g. Linear Algebra"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-text-primary">Question Count</p>
        <div className="flex gap-2">
          {counts.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCount(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                item === count
                  ? "bg-accent text-white"
                  : "border border-card-border bg-card text-text-secondary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="mt-6 w-full"
        loading={loading}
        disabled={keyword.trim().length === 0}
        onClick={() => onGenerate({ keyword: keyword.trim(), count })}
      >
        Generate Quiz
      </Button>
    </div>
  );
}
