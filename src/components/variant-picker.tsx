"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ugx, waLink } from "@/lib/format";
import { useCart } from "./cart";
import { WhatsAppIcon } from "./icons";

type V = { id: number; color: string; size: string; stock: number };

export function VariantPicker({
  product,
  variants,
  whatsappNumber,
  productUrl,
}: {
  product: { id: number; slug: string; name: string; price: number; imageId: number | null };
  variants: V[];
  whatsappNumber: string;
  productUrl: string;
}) {
  const { add } = useCart();
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color).filter(Boolean))], [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean))], [variants]);

  const firstAvailable = variants.find((v) => v.stock > 0);
  const [color, setColor] = useState(firstAvailable?.color ?? colors[0] ?? "");
  const [size, setSize] = useState(firstAvailable?.size ?? sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.color === color && v.size === size);
  const available = selected && selected.stock > 0;

  const stockFor = (c: string, s: string) => variants.find((v) => v.color === c && v.size === s)?.stock ?? 0;
  const anyStockForColor = (c: string) => variants.some((v) => v.color === c && v.stock > 0);

  function pickColor(c: string) {
    setColor(c);
    setQty(1);
    // keep the size if it exists for this colour, otherwise jump to the first size in stock
    if (stockFor(c, size) <= 0) {
      const v = variants.find((x) => x.color === c && x.stock > 0);
      if (v) setSize(v.size);
    }
  }

  function addToCart() {
    if (!selected || !available) return;
    add({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: selected.color,
      size: selected.size,
      price: product.price,
      imageId: product.imageId,
      qty,
      maxQty: selected.stock,
    });
    setAdded(true);
  }

  const variantText = [color && `Colour: ${color}`, size && `Size: ${size}`].filter(Boolean).join(", ");
  const waText = `Hello Josephine! I'd like to order:\n${product.name}${variantText ? ` (${variantText})` : ""} x${qty} – ${ugx(product.price * qty)}\n${productUrl}`;

  return (
    <div className="mt-6 space-y-5">
      {colors.length > 0 && (
        <fieldset>
          <legend className="label">Colour: <span className="text-cream">{color}</span></legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const ok = anyStockForColor(c);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!ok}
                  onClick={() => pickColor(c)}
                  className={`rounded-full border px-4 py-2 text-sm ${c === color ? "border-gold bg-gold/10 text-gold-light" : "border-line"} ${ok ? "" : "line-through opacity-40"}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          <legend className="label">Size: <span className="text-cream">{size}</span></legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const ok = colors.length > 0 ? stockFor(color, sz) > 0 : stockFor("", sz) > 0;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={!ok}
                  onClick={() => {
                    setSize(sz);
                    setQty(1);
                  }}
                  className={`min-w-12 rounded-lg border px-3 py-2 text-sm ${sz === size ? "border-gold bg-gold/10 text-gold-light" : "border-line"} ${ok ? "" : "line-through opacity-40"}`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {available ? (
        <>
          <div className="flex items-center gap-3">
            <span className="label mb-0">Quantity</span>
            <div className="flex items-center rounded-full border border-line">
              <button type="button" className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less">−</button>
              <span className="w-8 text-center">{qty}</span>
              <button type="button" className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.min(selected.stock, q + 1))} aria-label="More">+</button>
            </div>
            {selected.stock <= 3 && <span className="text-xs text-pink">Only {selected.stock} left!</span>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={addToCart} className="btn btn-pink flex-1">Add to cart</button>
            <a href={waLink(whatsappNumber, waText)} target="_blank" rel="noopener" className="btn btn-wa flex-1">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
          </div>
          {added && (
            <p className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
              Added to your cart ✨ <Link href="/cart" className="font-semibold text-gold-light underline">Go to cart</Link>
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-line p-3 text-sm text-muted">
          {variants.some((v) => v.stock > 0) ? "This option is sold out – please choose another." : "Sold out. Message us on WhatsApp to ask when it's back."}
        </p>
      )}
    </div>
  );
}
