/* eslint-disable @next/next/no-img-element */

/** Shows an uploaded photo, or an elegant placeholder until Josephine adds one. */
export function ProductImage({
  imageId,
  name,
  className = "",
  eager = false,
}: {
  imageId: number | null | undefined;
  name: string;
  className?: string;
  eager?: boolean;
}) {
  if (imageId) {
    return (
      <img
        src={`/api/img/${imageId}`}
        alt={name}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${name} (photo coming soon)`}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,#3a1f2c,#140f12_70%)] p-4 text-center ${className}`}
    >
      <span className="font-display text-4xl text-gold-shine">J</span>
      <span className="line-clamp-2 text-xs uppercase tracking-[0.2em] text-pink/80">{name}</span>
      <span className="text-[10px] text-muted">Photo coming soon</span>
    </div>
  );
}
