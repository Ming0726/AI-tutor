"use client";

import { useEffect } from "react";
import { useToastStore } from "@/stores/toastStore";

export function Toast() {
  const { message, type, visible, hideToast } = useToastStore();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(hideToast, 3000);
    return () => clearTimeout(timer);
  }, [hideToast, visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
      <div
        className={`rounded-card px-4 py-3 text-sm font-semibold text-white shadow-card ${
          type === "success" ? "bg-success" : "bg-error"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
