"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "@/components/cart";
import { normalizePhone, ugx } from "@/lib/format";
import { checkCode, checkLoyalty, placeOrder } from "./actions";

type Zone = { id: number; name: string; fee: number; note: string; upcountry: boolean };

export function CheckoutForm({ zones, loyaltyEvery }: { zones: Zone[]; loyaltyEvery: number }) {
  const { items, subtotal, ready, remove } = useCart();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [zoneId, setZoneId] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<"MOMO" | "CASH">("MOMO");
  const [loyalty, setLoyalty] = useState<{ eligible: boolean; percent: number } | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState<{ code: string; amount: number; label: string } | null>(null);
  const [codeMsg, setCodeMsg] = useState("");
  const [checkingCode, startCode] = useTransition();

  const zone = zones.find((z) => z.id === zoneId);
  const loyaltyAmount = loyalty?.eligible ? Math.round((subtotal * loyalty.percent) / 100) : 0;
  const useCode = !!code && code.amount > loyaltyAmount;
  const discount = useCode ? code.amount : loyaltyAmount;

  function applyCode(value: string) {
    setCodeMsg("");
    if (!value.trim()) {
      setCode(null);
      return;
    }
    startCode(async () => {
      const r = await checkCode(value, subtotal);
      if (r.ok) setCode({ code: value, amount: r.amount, label: r.label });
      else {
        setCode(null);
        setCodeMsg(r.error);
      }
    });
  }

  // re-check the code when the cart total changes (e.g. minimum order, % amount)
  useEffect(() => {
    if (code && subtotal > 0) applyCode(code.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);
  const total = subtotal - discount + (zone?.fee ?? 0);

  useEffect(() => {
    const p = normalizePhone(phone);
    if (!p) {
      setLoyalty(null);
      return;
    }
    let cancelled = false;
    checkLoyalty(p).then((r) => !cancelled && setLoyalty(r));
    return () => {
      cancelled = true;
    };
  }, [phone]);

  if (!ready) return <div className="py-20" />;
  if (items.length === 0) {
    return (
      <p className="mt-6 text-muted">
        Your cart is empty. <Link href="/" className="text-gold-light underline">Continue shopping</Link>
      </p>
    );
  }

  function submit(form: FormData) {
    setError("");
    start(async () => {
      const r = await placeOrder({
        name: String(form.get("name") ?? ""),
        phone,
        zoneId: Number(zoneId),
        address: String(form.get("address") ?? ""),
        note: String(form.get("note") ?? ""),
        payment,
        code: code?.code ?? "",
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      });
      if (r.ok) {
        // the cart is emptied on the order page (see ClearCart) so this page doesn't re-render mid-navigation
        router.push(`/order/${r.token}?new=1`);
      } else {
        setError(r.error);
        r.soldOut?.forEach((id) => remove(id));
      }
    });
  }

  return (
    <form action={submit} className="mt-6 space-y-6">
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-gold-light">Your details</h2>
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number (WhatsApp)</label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="07XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
          {phone.length >= 10 && !normalizePhone(phone) && (
            <p className="mt-1 text-xs text-pink">Please enter a Ugandan number like 0772 123 456</p>
          )}
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-gold-light">Delivery</h2>
        <div>
          <label className="label" htmlFor="zone">Delivery area</label>
          <select
            id="zone"
            required
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : "")}
            className="input"
          >
            <option value="">Choose your area…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} – {ugx(z.fee)}
              </option>
            ))}
          </select>
          {zone?.note && <p className="mt-1 text-xs text-muted">{zone.note}</p>}
        </div>
        <div>
          <label className="label" htmlFor="address">
            {zone?.upcountry ? "Town + bus/taxi park where you will pick up" : "Area, street and nearest landmark"}
          </label>
          <textarea
            id="address"
            name="address"
            required
            minLength={3}
            rows={2}
            placeholder={zone?.upcountry ? "e.g. Mbarara, main taxi park" : "e.g. Ntinda, near Capital Shoppers, blue gate"}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="note">Note for Josephine (optional)</label>
          <input id="note" name="note" className="input" placeholder="e.g. call me before coming" />
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-gold-light">Payment</h2>
        {[
          ["MOMO", "MTN Mobile Money", "You'll see the number to pay after placing the order."],
          ["CASH", "Cash on delivery", "Pay the rider when your order arrives."],
        ].map(([value, title, help]) => (
          <label
            key={value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${payment === value ? "border-gold bg-gold/5" : "border-line"}`}
          >
            <input
              type="radio"
              name="payment"
              value={value}
              checked={payment === value}
              onChange={() => setPayment(value as "MOMO" | "CASH")}
              className="mt-1 accent-[#e0558f]"
            />
            <span>
              <span className="block font-medium">{title}</span>
              <span className="block text-sm text-muted">{help}</span>
            </span>
          </label>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-gold-light">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-4">
              <span>
                {i.name} {[i.color, i.size].filter(Boolean).length > 0 && <span className="text-muted">({[i.color, i.size].filter(Boolean).join(", ")})</span>} ×{i.qty}
              </span>
              <span className="shrink-0">{ugx(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{ugx(subtotal)}</dd></div>
          {discount > 0 && (
            <div className="flex justify-between text-pink">
              <dt>🎁 {useCode ? code.label : `Loyalty reward (${loyalty?.percent}% off)`}</dt>
              <dd>−{ugx(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{zone ? ugx(zone.fee) : "Choose area"}</dd></div>
          <div className="flex justify-between pt-2 text-lg font-semibold text-gold-light"><dt>Total</dt><dd>{ugx(total)}</dd></div>
        </dl>
        <div className="mt-4 flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Discount code"
            aria-label="Discount code"
            className="input uppercase"
          />
          <button type="button" onClick={() => applyCode(codeInput)} disabled={checkingCode} className="btn btn-outline shrink-0 px-4">
            {checkingCode ? "…" : "Apply"}
          </button>
        </div>
        {codeMsg && <p className="mt-1 text-xs text-pink">{codeMsg}</p>}
        {code && !useCode && loyaltyAmount > 0 && (
          <p className="mt-1 text-xs text-muted">Your loyalty reward is bigger than this code, so we use the loyalty reward.</p>
        )}
        {code && useCode && <p className="mt-1 text-xs text-gold-light">✓ Code applied</p>}
        {loyalty && !loyalty.eligible && (
          <p className="mt-3 text-xs text-muted">Every {loyaltyEvery}th order gets {loyalty.percent}% off automatically.</p>
        )}
      </section>

      {error && <p className="rounded-xl border border-pink-deep bg-pink-deep/10 p-3 text-sm">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-pink w-full text-base">
        {pending ? "Placing order…" : `Place order · ${ugx(total)}`}
      </button>
    </form>
  );
}
