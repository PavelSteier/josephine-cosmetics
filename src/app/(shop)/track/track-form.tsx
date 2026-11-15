"use client";

import { useActionState } from "react";
import { findOrder } from "./actions";

export function TrackForm() {
  const [error, action, pending] = useActionState(findOrder, null);
  return (
    <form action={action} className="card mt-6 space-y-4 p-5">
      <div>
        <label className="label" htmlFor="number">Order number</label>
        <input id="number" name="number" required placeholder="JC1005" className="input uppercase" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" required inputMode="tel" placeholder="07XX XXX XXX" className="input" />
      </div>
      {error && <p className="text-sm text-pink">{error}</p>}
      <button className="btn btn-pink w-full" disabled={pending}>{pending ? "Searching…" : "Find my order"}</button>
    </form>
  );
}
