export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`tracking-wider text-gold ${className}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}
