"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";

export function ProductGallery({ imageIds, name }: { imageIds: number[]; name: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-line">
        <ProductImage imageId={imageIds[active]} name={name} eager />
      </div>
      {imageIds.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {imageIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border ${i === active ? "border-gold" : "border-line"}`}
              aria-label={`Photo ${i + 1}`}
            >
              <ProductImage imageId={id} name={name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
