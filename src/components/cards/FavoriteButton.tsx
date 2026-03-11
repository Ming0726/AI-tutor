"use client";

import { useState } from "react";

type FavoriteButtonProps = {
  active: boolean;
  icon: "heart" | "star";
  onClick: () => void;
};

export function FavoriteButton({ active, icon, onClick }: FavoriteButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setPressed(true);
        onClick();
        setTimeout(() => setPressed(false), 160);
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${pressed ? "scale-125" : "scale-100"}`}
      aria-label={icon === "heart" ? "Toggle favorite" : "Toggle star"}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "#F5A623" : "none"}
        stroke={active ? "#F5A623" : "#8C8C8C"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "heart" ? (
          <path d="M12 20s-7-4.5-9-8.5C1.2 8.2 3.1 5 6.5 5 8.6 5 10 6.2 12 8c2-1.8 3.4-3 5.5-3C20.9 5 22.8 8.2 21 11.5 19 15.5 12 20 12 20z" />
        ) : (
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.1L12 17.1 6.4 20l1.1-6.1L3 9.6l6.2-.9z" />
        )}
      </svg>
    </button>
  );
}
