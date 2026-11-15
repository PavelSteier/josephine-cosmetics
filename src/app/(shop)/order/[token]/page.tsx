import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { WhatsAppIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { displayPhone, orderNumber, STATUS_LABEL, ugx, waLink } from "@/lib/format";
import { orderSummaryText } from "@/lib/order-text";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

const STEPS = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ new?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { token } = await params;
  const isNew = (await searchParams).new === "1";
  const order = await db.order.findUnique({ where: { token }, include: { items: true } });
  if (!order) notFound();
  const s = await getSettings();
  const num = orderNumber(order.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const waText = `Hello Josephine! I just placed an order on the website.\n\n${orderSummaryText(order)}\n\nTrack: ${siteUrl}/order/${order.token}`;
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-2xl pt-8">
      {isNew && <ClearCart />}
      {isNew ? (
        <div className="text-center">
          <p className="text-4xl" aria-hidden="true">✨</p>
          <h1 className="mt-2 font-display text-3xl text-gold-shine">Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="mt-2 text-muted">Your order <strong className="text-cream">{num}</strong> has been received.</p>
        </div>
      ) : (
        <h1 className="font-display text-3xl text-gold-shine">Order {num}</h1>
      )}

      {isNew && (
        <div className="card mt-6 border-[#25d366]/50 p-5 text-center">
          <p className="font-semibold">Last step: send your order to Josephine on WhatsApp</p>
          <p className="mt-1 text-sm text-muted">This lets her confirm it quickly and chat with you about delivery.</p>
          <a href={waLink(s.whatsappNumber, waText)} target="_blank" rel="noopener" className="btn btn-wa mt-4 w-full">
            <WhatsAppIcon /> Send order on WhatsApp
          </a>
        </div>
      )}

      {order.status === "CANCELLED" ? (
        <p className="card mt-6 p-5 text-center text-pink">This order was cancelled.</p>
      ) : (
        <ol className="card mt-6 grid grid-cols-4 gap-1 p-4 text-center text-[11px] sm:text-xs">
          {STEPS.map((st, i) => (
            <li key={st} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= stepIndex ? "bg-gold text-ink" : "border border-line text-muted"}`}
              >
                {i < stepIndex || order.status === "DELIVERED" ? "✓" : i + 1}
              </span>
              <span className={i <= stepIndex ? "text-gold-light" : "text-muted"}>{STATUS_LABEL[st]}</span>
            </li>
          ))}
        </ol>
      )}

      {order.paymentMethod === "MOMO" && !order.paid && order.status !== "CANCELLED" && (
        <div className="card mt-6 border-gold/60 p-5">
          <h2 className="font-semibold text-gold-light">Pay with MTN Mobile Money</h2>
          {s.merchantCode ? (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>Pay with <strong>MoMoPay</strong> from your MTN MoMo menu</li>
              <li>Merchant code: <strong className="text-gold-light">{s.merchantCode}</strong></li>
              <li>Amount: <strong className="text-gold-light">{ugx(order.total)}</strong></li>
              <li>Reference: <strong>{num}</strong></li>
            </ol>
          ) : (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>Send <strong className="text-gold-light">{ugx(order.total)}</strong> to</li>
              <li>
                <strong className="text-lg text-gold-light">{displayPhone(s.momoNumber)}</strong> ({s.momoName})
              </li>
              <li>Use reference <strong>{num}</strong> if asked</li>
            </ol>
          )}
          {order.deliveryFee === null && (
            <p className="mt-3 text-xs text-muted">This is for the items. Delivery is agreed with you on WhatsApp.</p>
          )}
          <p className="mt-3 text-xs text-muted">
            After paying, send the confirmation SMS on WhatsApp. Josephine will mark your order as paid.
          </p>
        </div>
      )}
      {order.paid && <p className="mt-4 text-center text-sm text-gold-light">✓ Payment received</p>}
      {order.paymentMethod === "CASH" && !order.paid && order.status !== "CANCELLED" && (
        <p className="card mt-6 p-5 text-sm">💵 Please have <strong className="text-gold-light">{ugx(order.total)}</strong> ready for the rider{order.deliveryFee === null ? ", plus the delivery fee agreed on WhatsApp" : ""}.</p>
      )}

      <section className="card mt-6 p-5 text-sm">
        <ul className="space-y-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>
                {i.name} {(i.color || i.size) && <span className="text-muted">({[i.color, i.size].filter(Boolean).join(", ")})</span>} ×{i.qty}
              </span>
              <span className="shrink-0">{ugx(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{ugx(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-pink"><dt>🎁 {order.discountLabel}</dt><dd>−{ugx(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery ({order.zoneName})</dt><dd>{order.deliveryFee === null ? "to be agreed" : ugx(order.deliveryFee)}</dd></div>
          <div className="flex justify-between pt-2 text-base font-semibold text-gold-light"><dt>Total</dt><dd>{ugx(order.total)}</dd></div>
        </dl>
        <p className="mt-4 text-muted">Deliver to: <span className="text-cream">{order.address}</span></p>
        <p className="text-muted">Phone: <span className="text-cream">{displayPhone(order.phone)}</span></p>
      </section>

      {!isNew && (
        <a href={waLink(s.whatsappNumber, `Hello Josephine! A question about my order ${num}.`)} className="btn btn-wa mt-6 w-full">
          <WhatsAppIcon /> Ask about this order
        </a>
      )}
      <p className="mt-6 text-center text-xs text-muted">
        Save this page to track your order, or use <Link href="/track" className="underline">Track my order</Link> with {num} and your phone number.
      </p>
    </div>
  );
}
