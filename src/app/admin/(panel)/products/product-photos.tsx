"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ProductImage } from "@/components/product-image";
import { deleteImage, makeMainImage } from "./actions";

/** Shrinks a phone photo to max 1400px JPEG so uploads are fast and cheap on data. */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("resize failed"))), "image/jpeg", 0.82));
}

export function ProductPhotos({ productId, imageIds, name }: { productId: number; imageIds: number[]; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setBusy(`Uploading ${i + 1} of ${list.length}…`);
      try {
        const blob = await resize(list[i]);
        const fd = new FormData();
        fd.append("productId", String(productId));
        fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        const r = await fetch("/api/admin/images", { method: "POST", body: fd });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Upload failed");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setBusy("");
    router.refresh();
  }

  return (
    <section className={`card p-4 ${pending ? "opacity-60" : ""}`}>
      <h2 className="mb-3 font-semibold text-gold-light">Photos</h2>
      {imageIds.length === 0 && <p className="mb-3 text-sm text-muted">No photos yet – the shop shows a placeholder.</p>}
      <div className="grid grid-cols-3 gap-2">
        {imageIds.map((id, i) => (
          <div key={id} className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line">
            <ProductImage imageId={id} name={name} />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-gold px-1.5 text-[10px] font-bold text-ink">MAIN</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 text-xs">
              {i > 0 ? (
                <button type="button" className="px-2 py-1.5" onClick={() => start(async () => { await makeMainImage(productId, id); router.refresh(); })}>★ Main</button>
              ) : <span />}
              <button
                type="button"
                className="px-2 py-1.5 text-pink"
                onClick={() => confirm("Delete this photo?") && start(async () => { await deleteImage(id); router.refresh(); })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="btn btn-outline mt-3 w-full cursor-pointer">
        {busy || "📷 Add photos"}
        <input type="file" accept="image/*" multiple className="hidden" disabled={!!busy} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      </label>
      {error && <p className="mt-2 text-sm text-pink">{error}</p>}
    </section>
  );
}
