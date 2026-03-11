"use client";

import { useCallback, useRef, useState } from "react";
import { useToastStore } from "@/stores/toastStore";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type UseExplainArgs = {
  style: "professional" | "concise" | "humorous" | "friendly";
  level: "beginner" | "intermediate" | "advanced";
};

export function useExplain({ style, level }: UseExplainArgs) {
  const showToast = useToastStore((state) => state.showToast);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const history = messages;
      const nextMessages = [...history, { role: "user" as const, content: text }];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            style,
            level,
            history,
            conversationId: conversationId ?? undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to stream response");
        }

        if (!response.body) {
          throw new Error("Response stream is empty");
        }

        const headerConversationId = response.headers.get("x-conversation-id");
        if (headerConversationId) {
          setConversationId(headerConversationId);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setMessages((current) => {
            if (current.length === 0) return current;
            const copied = [...current];
            copied[copied.length - 1] = {
              role: "assistant",
              content: copied[copied.length - 1].content + chunk,
            };
            return copied;
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Network or server error. Please try again.";
        setError(message);
        showToast({ message, type: "error" });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming, level, messages, showToast, style],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const clearConversation = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, [stopStreaming]);

  return {
    messages,
    isStreaming,
    conversationId,
    error,
    sendMessage,
    stopStreaming,
    clearConversation,
  };
}
