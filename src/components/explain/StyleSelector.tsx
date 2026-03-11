"use client";

import { useState } from "react";
import { EXPLAIN_STYLES, KNOWLEDGE_LEVELS } from "@/lib/constants";
import { usePreferencesStore } from "@/stores/preferencesStore";

export function StyleSelector() {
  const explainStyle = usePreferencesStore((state) => state.explainStyle);
  const knowledgeLevel = usePreferencesStore((state) => state.knowledgeLevel);
  const setExplainStyle = usePreferencesStore((state) => state.setExplainStyle);
  const setKnowledgeLevel = usePreferencesStore((state) => state.setKnowledgeLevel);
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-card border border-card-border bg-card p-3 shadow-card">
      <button
        type="button"
        className="mb-2 text-sm font-semibold text-text-primary"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "▾" : "▸"} Preferences
      </button>

      {open ? (
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Style</p>
            <div className="flex flex-wrap gap-2">
              {EXPLAIN_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setExplainStyle(style)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                    explainStyle === style
                      ? "bg-accent text-white"
                      : "border border-card-border bg-card text-text-secondary"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Level</p>
            <div className="flex flex-wrap gap-2">
              {KNOWLEDGE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setKnowledgeLevel(level)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                    knowledgeLevel === level
                      ? "bg-accent text-white"
                      : "border border-card-border bg-card text-text-secondary"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
