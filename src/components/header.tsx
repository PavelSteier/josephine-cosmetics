import Link from "next/link";
import { CartButton } from "./cart-button";

export function Header({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="leading-tight">
          <span className="block font-display text-2xl text-gold-shine">Josephine</span>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-pink">Cosmetics & Jewelry</span>
        </Link>
        <CartButton />
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/c/${c.slug}`}
            className="shrink-0 rounded-full border border-line px-4 py-1.5 text-sm text-cream/90 hover:border-gold hover:text-gold-light"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
