"use client";

import type { OrderStatus } from "@prisma/client";
import { useTransition } from "react";
import { STATUS_LABEL } from "@/lib/format";
import { setPaid, setStatus } from "../actions";

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
