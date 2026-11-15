import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { displayPhone, orderNumber, ugx, waLink } from "@/lib/format";
import { previousOrderCount } from "@/lib/loyalty";
import { getSettings } from "@/lib/settings";
import { DeliveryFeeEditor, OrderControls } from "./controls";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const order = Number.isInteger(id) ? await db.order.findUnique({ where: { id }, include: { items: true } }) : null;
  if (!order) notFound();
  const [s, customerOrders] = await Promise.all([getSettings(), previousOrderCount(order.phone)]);
  const num = orderNumber(order.id);
  const first = order.customerName.split(" ")[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const track = `${siteUrl}/order/${order.token}`;
  // delivery fee is agreed per order; if not saved yet the message has a blank for Josephine to fill in WhatsApp
  const deliveryLine =
    order.deliveryFee === null ? `\nDelivery to ${order.zoneName}: ____ UGX` : `\nDelivery: ${ugx(order.deliveryFee)}`;
  const payLine =
    order.paymentMethod === "MOMO" && !order.paid
      ? s.merchantCode
        ? `\nPlease pay ${ugx(order.total)} with MoMoPay, merchant code ${s.merchantCode}, reference ${num}.`
        : `\nPlease send ${ugx(order.total)} by MTN Mobile Money to ${displayPhone(s.momoNumber)} (${s.momoName}), reference ${num}.`
      : order.paymentMethod === "CASH"
        ? `\nPlease have ${ugx(order.total)} ready for the rider.`
        : "";

  const templates: [string, string][] = [
    ["✅ Confirm order", `Hello ${first}! 💖 Your order ${num} is confirmed.${deliveryLine}${payLine}\nTrack it here: ${track}\nThank you for shopping with Josephine Cosmetics & Jewelry ✨`],
    ["🛵 Out for delivery", `Hello ${first}! Your order ${num} is on the way 🛵 The rider will call you on ${displayPhone(order.phone)}.`],
    ["💸 Payment received", `Hello ${first}, we have received your payment of ${ugx(order.total)} for order ${num}. Thank you! 💖`],
    ["⭐ Thank you", `Hello ${first}! Thank you for your order ${num} 💖 We hope you love it. Please tag us on Instagram / TikTok!`],
  ];

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-muted">← Orders</Link>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl text-gold-light">{num}</h1>
        <p className="text-xs text-muted">
          {order.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Kampala", dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <OrderControls id={order.id} status={order.status} paid={order.paid} />

      <section className="card space-y-1 p-4 text-sm">
        <p className="text-lg font-semibold">{order.customerName}</p>
        <p>
          <a href={`tel:+${order.phone}`} className="text-gold-light underline">{displayPhone(order.phone)}</a>
          <span className="ml-2 text-xs text-muted">{customerOrders} order(s) from this number</span>
        </p>
        <p className="text-muted">📍 {order.zoneName}</p>
        <p>{order.address}</p>
        {order.note && <p className="rounded-lg bg-ink-3 p-2 text-pink">“{order.note}”</p>}
        <p className="pt-1 text-muted">Payment: {order.paymentMethod === "MOMO" ? "MTN Mobile Money" : "Cash on delivery"}</p>
      </section>

      <section className="card p-4 text-sm">
        <ul className="space-y-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>
                {i.name} {(i.color || i.size) && <span className="text-muted">({[i.color, i.size].filter(Boolean).join(", ")})</span>} <strong>×{i.qty}</strong>
              </span>
              <span className="shrink-0">{ugx(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{ugx(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-pink"><dt>{order.discountLabel}</dt><dd>−{ugx(order.discount)}</dd></div>}
          <DeliveryFeeEditor id={order.id} fee={order.deliveryFee} />
          <div className="flex justify-between text-base font-semibold text-gold-light"><dt>Total</dt><dd>{ugx(order.total)}</dd></div>
        </dl>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold-light"><WhatsAppIcon className="h-4 w-4" /> Message the customer</h2>
        <div className="grid grid-cols-2 gap-2">
          {templates.map(([label, text]) => (
            <a key={label} href={waLink(order.phone, text)} target="_blank" rel="noopener" className="rounded-xl border border-line p-3 text-center text-sm hover:border-[#25d366]">
              {label}
            </a>
          ))}
        </div>
        <a href={waLink(order.phone, `Hello ${first}! `)} target="_blank" rel="noopener" className="btn btn-wa mt-3 w-full">
          <WhatsAppIcon /> Open chat
        </a>
      </section>
    </div>
  );
}
