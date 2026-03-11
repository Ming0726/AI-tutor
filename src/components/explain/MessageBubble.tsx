"use client";

import ReactMarkdown from "react-markdown";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  streaming?: boolean;
};

export function MessageBubble({ role, content, timestamp, streaming = false }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-2 sm:max-w-[70%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser ? (
          <div className="mt-1 h-7 w-7 shrink-0 rounded-full border border-card-border bg-card p-1">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="8" width="12" height="10" rx="2" />
              <path d="M9 8V6h6v2M9 12h.01M15 12h.01" />
            </svg>
          </div>
        ) : null}

        <div className={`rounded-card px-4 py-3 text-sm ${isUser ? "rounded-br-sm bg-accent text-white" : "rounded-bl-sm bg-card text-text-primary shadow-card"}`}>
          <div className="prose prose-sm max-w-none prose-headings:m-0 prose-p:m-0 prose-ul:my-1 prose-code:rounded prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5">
            <ReactMarkdown>{content + (streaming ? "|" : "")}</ReactMarkdown>
          </div>
          {timestamp ? <p className={`mt-2 text-[11px] ${isUser ? "text-white/80" : "text-text-secondary"}`}>{timestamp}</p> : null}
        </div>
      </div>
    </div>
  );
}
