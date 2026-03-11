import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
  variant?: "card" | "text" | "circle" | "button";
};

const variantClasses: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  card: "rounded-card",
  text: "rounded",
  circle: "rounded-full",
  button: "rounded-card",
};

export function Skeleton({
  width,
  height,
  className,
  variant = "card",
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-card-border",
        variantClasses[variant],
        className,
      )}
      style={{ width, height }}
    />
  );
}
