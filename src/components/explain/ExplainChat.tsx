"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/explain/MessageBubble";
import { StyleSelector } from "@/components/explain/StyleSelector";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { useExplain } from "@/hooks/useExplain";
import { usePreferencesStore } from "@/stores/preferencesStore";

export function ExplainChat() {
  const explainStyle = usePreferencesStore((state) => state.explainStyle);
  const knowledgeLevel = usePreferencesStore((state) => state.knowledgeLevel);
  const { messages, isStreaming, error, sendMessage, stopStreaming, clearConversation } = useExplain({
    style: explainStyle,
    level: knowledgeLevel,
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col gap-3">
      <StyleSelector />

      <div className="flex-1 space-y-3 overflow-y-auto rounded-card border border-card-border bg-cream-dark p-3">
        {messages.length === 0 ? (
          <div className="rounded-card bg-card p-4 text-sm text-text-secondary shadow-card">
            Ask any concept question. I will explain based on your selected style and level.
          </div>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.role}-${index}`}
            role={message.role}
            content={message.content}
            streaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
          />
        ))}

        {isStreaming ? (
          <div className="rounded-card bg-card px-4 py-2 shadow-card">
            <LoadingDots label="AI is thinking..." />
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}

      <div className="rounded-card border border-card-border bg-card p-2 shadow-card">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask AI Tutor..."
            className="h-11 flex-1 rounded-card border border-card-border bg-card px-4 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => {
              if (isStreaming) {
                stopStreaming();
                return;
              }
              void sendMessage(input);
              setInput("");
            }}
            disabled={!isStreaming && input.trim().length === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white disabled:bg-card-border"
          >
            {isStreaming ? (
              <span className="h-3 w-3 rounded-sm bg-white" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={clearConversation}
            className="h-11 rounded-card border border-card-border px-3 text-xs font-semibold text-text-secondary hover:bg-cream-dark"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
