"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { ProductImage } from "@/components/product-image";
import { ugx } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();

  if (!ready) return <div className="py-20" />;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl text-gold-shine">Your cart is empty</h1>
        <Link href="/" className="btn btn-pink mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-8">
      <h1 className="font-display text-3xl text-gold-shine">Your cart</h1>
      <ul className="mt-6 divide-y divide-line">
        {items.map((i) => (
          <li key={i.variantId} className="flex gap-4 py-4">
            <Link href={`/p/${i.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-line">
              <ProductImage imageId={i.imageId} name={i.name} />
            </Link>
            <div className="flex flex-1 flex-col">
              <Link href={`/p/${i.slug}`} className="text-sm">{i.name}</Link>
              <p className="text-xs text-muted">{[i.color, i.size].filter(Boolean).join(" · ")}</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center rounded-full border border-line">
                  <button type="button" className="h-9 w-9" onClick={() => setQty(i.variantId, i.qty - 1)} aria-label="Less">−</button>
                  <span className="w-6 text-center text-sm">{i.qty}</span>
                  <button type="button" className="h-9 w-9" onClick={() => setQty(i.variantId, i.qty + 1)} aria-label="More">+</button>
                </div>
                <span className="text-sm font-semibold text-gold-light">{ugx(i.price * i.qty)}</span>
              </div>
            </div>
            <button type="button" onClick={() => remove(i.variantId)} className="self-start text-muted" aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg">
        <span>Subtotal</span>
        <span className="font-semibold text-gold-light">{ugx(subtotal)}</span>
      </div>
      <p className="mt-1 text-sm text-muted">Delivery fee is agreed with Josephine on WhatsApp after you order.</p>
      <Link href="/checkout" className="btn btn-pink mt-6 w-full">Checkout</Link>
    </div>
  );
}
