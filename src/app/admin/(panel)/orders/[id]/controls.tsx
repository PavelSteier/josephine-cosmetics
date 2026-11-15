"use client";

import type { OrderStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { STATUS_LABEL, ugx } from "@/lib/format";
import { setDeliveryFee, setPaid, setStatus } from "../actions";

const FLOW: OrderStatus[] = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];

export function OrderControls({ id, status, paid }: { id: number; status: OrderStatus; paid: boolean }) {
  const [pending, start] = useTransition();
  const next = FLOW[FLOW.indexOf(status) + 1];

  return (
    <section className={`card space-y-3 p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Status</span>
        <span className="font-semibold text-gold-light">{STATUS_LABEL[status]}</span>
      </div>
      {next && (
        <button type="button" disabled={pending} onClick={() => start(() => setStatus(id, next))} className="btn btn-pink w-full">
          Mark as “{STATUS_LABEL[next]}”
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setPaid(id, !paid))}
        className={`btn w-full ${paid ? "btn-outline" : "btn-gold"}`}
      >
        {paid ? "✓ Paid – undo" : "Mark as paid"}
      </button>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">Change status manually</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[...FLOW, "CANCELLED" as OrderStatus].map((st) => (
            <button
              key={st}
              type="button"
              disabled={pending || st === status}
              onClick={() => {
                if (st === "CANCELLED" && !confirm("Cancel this order? Items go back into stock.")) return;
                start(() => setStatus(id, st));
              }}
              className={`rounded-lg border px-2 py-2 ${st === status ? "border-gold text-gold-light" : "border-line"}`}
            >
              {STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </details>
    </section>
  );
}

/** Delivery is agreed on WhatsApp; Josephine can note the agreed fee here so the total is right. */
export function DeliveryFeeEditor({ id, fee }: { id: number; fee: number | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fee === null ? "" : String(fee));
  const [pending, start] = useTransition();
  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <dt>Delivery</dt>
        <dd>
          {fee === null ? <span className="text-muted">to be agreed</span> : ugx(fee)}
          <button type="button" onClick={() => setEditing(true)} className="ml-2 text-xs text-gold-light underline">
            {fee === null ? "add" : "change"}
          </button>
        </dd>
      </div>
    );
  }
  const save = (v: number | null) =>
    start(async () => {
      await setDeliveryFee(id, v);
      setEditing(false);
    });
  return (
    <div className="space-y-2 py-1">
      <dt className="text-muted">Delivery fee agreed with the customer (UGX)</dt>
      <dd className="flex gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" className="input" placeholder="e.g. 5000" autoFocus />
        <button type="button" disabled={pending} onClick={() => save(value.trim() ? Number(value.replace(/[^\d]/g, "")) || 0 : null)} className="btn btn-gold shrink-0 px-4">
          Save
        </button>
      </dd>
      {fee !== null && (
        <button type="button" disabled={pending} onClick={() => save(null)} className="text-xs text-muted underline">
          Remove (paid to rider)
        </button>
      )}
    </div>
  );
}
