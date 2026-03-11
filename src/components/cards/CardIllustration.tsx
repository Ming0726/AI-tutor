"use client";

import { useState } from "react";

type CardIllustrationProps = {
  url: string | null;
  alt: string;
};

export function CardIllustration({ url, alt }: CardIllustrationProps) {
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-accent/20 to-cream">
        <div className="absolute inset-0 flex items-center justify-center text-accent/70">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 15 5-4 4 3 3-2 6 5" />
            <circle cx="9" cy="9" r="1" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] w-full bg-accent-light">
      <img
        src={url}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-card-border" /> : null}
    </div>
  );
}
