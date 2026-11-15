"use client";

import { useState, useTransition } from "react";
import { saveZones } from "./actions";

type Z = { id?: number; name: string; fee: string; note: string; upcountry: boolean; active: boolean };

export function ZonesForm({ zones: initial }: { zones: Z[] }) {
  const [zones, setZones] = useState<Z[]>(initial);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const update = (i: number, patch: Partial<Z>) => setZones((zs) => zs.map((z, j) => (j === i ? { ...z, ...patch } : z)));
  const move = (i: number, d: number) =>
    setZones((zs) => {
      const j = i + d;
      if (j < 0 || j >= zs.length) return zs;
      const c = [...zs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <div className="space-y-3">
      {zones.map((z, i) => (
        <div key={z.id ?? `new-${i}`} className={`card space-y-3 p-4 ${z.active ? "" : "opacity-60"}`}>
          <div className="flex gap-2">
            <input value={z.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Area name" className="input" aria-label="Area name" />
            <input value={z.fee} inputMode="numeric" onChange={(e) => update(i, { fee: e.target.value })} placeholder="Price" className="input w-28" aria-label="Price" />
          </div>
          <input value={z.note} onChange={(e) => update(i, { note: e.target.value })} placeholder="Note for customers (optional)" className="input text-sm" aria-label="Note" />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={z.upcountry} onChange={(e) => update(i, { upcountry: e.target.checked })} className="h-4 w-4 accent-[#e0558f]" /> Bus / taxi</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={z.active} onChange={(e) => update(i, { active: e.target.checked })} className="h-4 w-4 accent-[#e0558f]" /> Active</label>
            <span className="ml-auto flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded border border-line px-2" aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="rounded border border-line px-2" aria-label="Move down">↓</button>
              <button type="button" onClick={() => setZones((zs) => zs.filter((_, j) => j !== i))} className="rounded border border-line px-2 text-pink" aria-label="Remove">✕</button>
            </span>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setZones((zs) => [...zs, { name: "", fee: "", note: "", upcountry: false, active: true }])} className="btn btn-outline w-full">
        + Add area
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMsg("");
            const r = await saveZones(zones.map((z) => ({ ...z, fee: Number(z.fee.replace(/[^\d]/g, "")) || 0 })));
            setMsg(r.ok ? "✓ Saved" : r.error ?? "Error");
            if (r.ok) location.reload();
          })
        }
        className="btn btn-pink w-full"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {msg && <p className="text-center text-sm text-gold-light">{msg}</p>}
    </div>
  );
}
