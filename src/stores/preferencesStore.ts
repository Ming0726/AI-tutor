"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXPLAIN_STYLES, KNOWLEDGE_LEVELS } from "@/lib/constants";

type ExplainStyle = (typeof EXPLAIN_STYLES)[number];
type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number];

type PreferencesState = {
  explainStyle: ExplainStyle;
  knowledgeLevel: KnowledgeLevel;
  setExplainStyle: (style: ExplainStyle) => void;
  setKnowledgeLevel: (level: KnowledgeLevel) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      explainStyle: "friendly",
      knowledgeLevel: "intermediate",
      setExplainStyle: (style) => set({ explainStyle: style }),
      setKnowledgeLevel: (level) => set({ knowledgeLevel: level }),
    }),
    {
      name: "ai-tutor-preferences",
    },
  ),
);
