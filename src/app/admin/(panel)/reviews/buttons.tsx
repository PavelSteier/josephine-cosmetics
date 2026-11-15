"use client";

import { useTransition } from "react";
import { approveReview, deleteReview } from "./actions";

export function ReviewButtons({ id, approved }: { id: number; approved: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={`mt-3 flex gap-2 ${pending ? "opacity-50" : ""}`}>
      <button type="button" disabled={pending} onClick={() => start(() => approveReview(id, !approved))} className={`btn flex-1 py-2 ${approved ? "btn-outline" : "btn-gold"}`}>
        {approved ? "Hide" : "Publish"}
      </button>
      <button type="button" disabled={pending} onClick={() => confirm("Delete this review?") && start(() => deleteReview(id))} className="btn btn-outline flex-1 py-2 text-pink">
        Delete
      </button>
    </div>
  );
}
