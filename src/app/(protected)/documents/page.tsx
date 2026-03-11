"use client";

import Link from "next/link";
import { useState } from "react";
import { AnalysisResult } from "@/components/documents/AnalysisResult";
import { FileUploader } from "@/components/documents/FileUploader";
import type { KeyPoint } from "@/components/documents/KeyPointCard";

export default function DocumentsPage() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (id: string) => {
    setStatus("processing");
    setError(null);

    const response = await fetch("/api/documents/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: id }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus("failed");
      setError(body?.error ?? "Analyze failed");
      return;
    }

    const data = await response.json();
    setKeyPoints(data.keyPoints ?? []);
    setStatus("completed");
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-card-border bg-card"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18 9 12l6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-3xl text-text-primary">Document Analysis</h1>
        </header>

        <FileUploader
          onUploaded={({ documentId: id }) => {
            setDocumentId(id);
            void analyze(id);
          }}
        />

        <AnalysisResult
          keyPoints={keyPoints}
          documentId={documentId}
          status={status}
          error={error}
          onRetry={() => {
            if (documentId) {
              void analyze(documentId);
            }
          }}
        />
      </div>
    </main>
  );
}
