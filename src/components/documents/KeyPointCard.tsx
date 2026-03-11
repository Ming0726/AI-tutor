"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type KeyPoint = {
  title: string;
  summary: string;
};

type KeyPointCardProps = {
  keyPoint: KeyPoint;
  index: number;
  documentId: string;
  onSaved?: () => void;
};

export function KeyPointCard({ keyPoint, index, documentId, onSaved }: KeyPointCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saved) return;
    setSaving(true);

    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: keyPoint.title,
        summary: keyPoint.summary,
        content: keyPoint.summary,
        source: "document_analysis",
        sourceDocumentId: documentId,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      return;
    }

    setSaved(true);
    onSaved?.();
  };

  return (
    <article className="mb-3 rounded-card bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-text-primary">{keyPoint.title}</h3>
          <p className="mt-1 text-sm text-text-secondary">{keyPoint.summary}</p>
          <div className="mt-3">
            <Button
              size="sm"
              variant={saved ? "secondary" : "primary"}
              disabled={saved}
              loading={saving}
              onClick={save}
            >
              {saved ? "Saved ✓" : "Save as Card"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
