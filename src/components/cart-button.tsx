"use client";

import Link from "next/link";
import { useCart } from "./cart";
import { BagIcon } from "./icons";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="relative rounded-full p-2 text-gold-light hover:bg-ink-3" aria-label={`Cart, ${count} items`}>
      <BagIcon />
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-deep px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
