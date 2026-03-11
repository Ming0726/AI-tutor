export function LoadingDots({ label }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
      {label ? <span>{label}</span> : null}
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
      </span>
    </div>
  );
}
