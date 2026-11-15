"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/(shop)/p/[slug]/review-actions";

export function ReviewForm({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) return <p className="card p-4 text-sm text-gold-light">Thank you! 💖 Your review will appear after Josephine checks it.</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn btn-outline w-full sm:w-auto">Write a review</button>;

  return (
    <form
      action={(f) => {
        setError("");
        start(async () => {
          const r = await submitReview({
            productId,
            rating,
            name: String(f.get("name") ?? ""),
            text: String(f.get("text") ?? ""),
            phone: String(f.get("phone") ?? ""),
            website: String(f.get("website") ?? ""),
          });
          if (r.ok) setDone(true);
          else setError(r.error ?? "Error");
        });
      }}
      className="card space-y-4 p-4"
    >
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className={n <= rating ? "text-gold" : "text-line"}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rv-name">Name</label>
        <input id="rv-name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="rv-text">Your review</label>
        <textarea id="rv-text" name="text" required rows={3} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="rv-phone">Phone used for your order (optional, not shown)</label>
        <input id="rv-phone" name="phone" inputMode="tel" placeholder="Adds a “Verified buyer” badge" className="input" />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-pink">{error}</p>}
      <button className="btn btn-pink w-full" disabled={pending}>{pending ? "Sending…" : "Send review"}</button>
    </form>
  );
}
