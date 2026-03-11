"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyPointCard, type KeyPoint } from "@/components/documents/KeyPointCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

type AnalysisResultProps = {
  keyPoints: KeyPoint[];
  documentId: string | null;
  status: "idle" | "processing" | "completed" | "failed";
  error?: string | null;
  onRetry: () => void;
};

export function AnalysisResult({
  keyPoints,
  documentId,
  status,
  error,
  onRetry,
}: AnalysisResultProps) {
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null);
  const [allSaved, setAllSaved] = useState(false);

  const saveAll = async () => {
    if (!documentId || keyPoints.length === 0) return;

    setAllSaved(false);
    for (let i = 0; i < keyPoints.length; i += 1) {
      const point = keyPoints[i];
      setSaveProgress({ current: i + 1, total: keyPoints.length });

      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: point.title,
          summary: point.summary,
          content: point.summary,
          source: "document_analysis",
          sourceDocumentId: documentId,
        }),
      });
    }

    setSaveProgress(null);
    setAllSaved(true);
  };

  if (status === "idle") return null;

  if (status === "processing") {
    return (
      <div className="mt-6 rounded-card bg-card p-5 shadow-card">
        <p className="mb-3 text-sm font-semibold text-text-secondary">Analyzing document...</p>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-6 rounded-card bg-card p-5 shadow-card">
        <p className="text-error">{error ?? "Analyze failed"}</p>
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-text-primary">Found {keyPoints.length} key points</p>
        <Button size="sm" variant="secondary" onClick={saveAll}>
          Save All as Cards
        </Button>
      </div>

      {saveProgress ? (
        <p className="mb-3 text-sm text-text-secondary">
          Saving {saveProgress.current}/{saveProgress.total}...
        </p>
      ) : null}

      {allSaved ? (
        <p className="mb-3 text-sm text-success">
          All saved! <Link href="/cards" className="underline">View in Cards →</Link>
        </p>
      ) : null}

      {keyPoints.map((point, index) => (
        <KeyPointCard key={`${point.title}-${index}`} keyPoint={point} index={index + 1} documentId={documentId ?? ""} />
      ))}
    </section>
  );
}
