import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { orderNumber, STATUS_COLOR, STATUS_LABEL, ugx } from "@/lib/format";

const FILTERS: [string, string][] = [
  ["open", "To do"],
  ["NEW", "New"],
  ["CONFIRMED", "Confirmed"],
  ["OUT_FOR_DELIVERY", "Out"],
  ["DELIVERED", "Delivered"],
  ["CANCELLED", "Cancelled"],
  ["all", "All"],
];


export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const f = (await searchParams).f ?? "open";
  const where =
    f === "all"
      ? {}
      : f === "open"
        ? { status: { in: ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY"] as OrderStatus[] } }
        : { status: f as OrderStatus };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [orders, today] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { items: true } } } }),
    db.order.aggregate({
      where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-muted">Orders today</p>
          <p className="text-2xl font-semibold text-gold-light">{today._count}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Sales today</p>
          <p className="text-2xl font-semibold text-gold-light">{ugx(today._sum.total ?? 0)}</p>
        </div>
      </div>

      <div className="my-4 flex gap-2 overflow-x-auto text-sm [scrollbar-width:none]">
        {FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?f=${key}`}
            className={`shrink-0 rounded-full px-3 py-1 ${f === key ? "bg-pink-deep text-white" : "border border-line text-muted"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="py-10 text-center text-muted">No orders here.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="card flex items-center justify-between gap-3 p-4 hover:border-gold">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {orderNumber(o.id)} <span className="font-normal text-muted">· {o.customerName}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {o.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Kampala", dateStyle: "short", timeStyle: "short" })} · {o.zoneName} · {o._count.items} item(s)
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-gold-light">{ugx(o.total)}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  <p className="mt-0.5 text-[10px] text-muted">{o.paymentMethod === "MOMO" ? "MoMo" : "Cash"} · {o.paid ? "paid ✓" : "unpaid"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
