"use client";

import { useActionState, useTransition } from "react";
import { createCode, deleteCode, toggleCode } from "./actions";

export function NewCodeForm() {
  const [msg, action, pending] = useActionState(createCode, null);
  return (
    <details className="card p-4" open={msg !== null && !msg.startsWith("✓")}>
      <summary className="cursor-pointer font-semibold text-gold-light">+ New code</summary>
      <form action={action} className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="code">Code</label>
          <input id="code" name="code" required placeholder="WELCOME10" className="input font-mono uppercase" autoCapitalize="characters" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="type">Type</label>
            <select id="type" name="type" className="input">
              <option value="PERCENT">% off</option>
              <option value="FIXED">UGX off</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="value">Discount</label>
            <input id="value" name="value" required inputMode="numeric" placeholder="10" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="minOrder">Min. order UGX</label>
            <input id="minOrder" name="minOrder" inputMode="numeric" placeholder="optional" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="maxUses">Max uses</label>
            <input id="maxUses" name="maxUses" inputMode="numeric" placeholder="unlimited" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="expiresAt">Valid until (optional)</label>
          <input id="expiresAt" name="expiresAt" type="date" className="input" />
        </div>
        {msg && <p className={`text-sm ${msg.startsWith("✓") ? "text-gold-light" : "text-pink"}`}>{msg}</p>}
        <button className="btn btn-pink w-full" disabled={pending}>{pending ? "Saving…" : "Create code"}</button>
      </form>
    </details>
  );
}

export function CodeActions({ id, active }: { id: number; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={`mt-3 flex gap-4 text-sm ${pending ? "opacity-50" : ""}`}>
      <button type="button" disabled={pending} onClick={() => start(() => toggleCode(id, !active))} className="text-gold-light underline">
        {active ? "Turn off" : "Turn on"}
      </button>
      <button type="button" disabled={pending} onClick={() => confirm("Delete this code?") && start(() => deleteCode(id))} className="text-pink underline">
        Delete
      </button>
    </div>
  );
}
