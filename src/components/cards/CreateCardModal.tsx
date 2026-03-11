"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCategories } from "@/hooks/useCategories";

type CreateCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateCardModal({ isOpen, onClose, onCreated }: CreateCardModalProps) {
  const { categories } = useCategories();
  const [topic, setTopic] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    const response = await fetch("/api/cards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.trim(), categoryId: categoryId || undefined }),
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Failed to generate card");
      return;
    }

    setTopic("");
    setCategoryId("");
    onClose();
    onCreated();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Card">
      <div className="space-y-4">
        <Input
          label="Topic"
          placeholder="e.g. Fourier Transform"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">Category (optional)</p>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-11 w-full rounded-card border border-card-border bg-card px-3 text-sm text-text-primary outline-none focus:border-accent"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}

        <Button loading={loading} disabled={!topic.trim()} className="w-full" onClick={handleGenerate}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
    </Modal>
  );
}
