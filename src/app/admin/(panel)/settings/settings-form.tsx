"use client";

import { useActionState } from "react";
import type { Settings } from "@/lib/settings";
import { saveSettings } from "./actions";

function Field({ name, label, value, help, inputMode }: { name: keyof Settings; label: string; value: string; help?: string; inputMode?: "numeric" | "tel" | "url" }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={value} inputMode={inputMode} className="input" />
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
    </div>
  );
}

export function SettingsForm({ s }: { s: Settings }) {
  const [msg, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className="space-y-4">
      <section className="card space-y-4 p-4">
        <h2 className="font-semibold text-gold-light">Payment</h2>
        <Field name="momoNumber" label="MTN Mobile Money number" value={s.momoNumber} inputMode="tel" />
        <Field name="momoName" label="Name on the MoMo account" value={s.momoName} />
        <Field name="merchantCode" label="MoMoPay merchant code" value={s.merchantCode} help="Leave empty until you have one. When filled in, customers see the merchant code instead of your number." inputMode="numeric" />
      </section>
      <section className="card space-y-4 p-4">
        <h2 className="font-semibold text-gold-light">Shop</h2>
        <Field name="shopName" label="Shop name" value={s.shopName} />
        <Field name="whatsappNumber" label="WhatsApp number for orders" value={s.whatsappNumber} inputMode="tel" />
        <Field name="returnDays" label="Returns accepted within (days)" value={s.returnDays} inputMode="numeric" />
        <div className="grid grid-cols-2 gap-3">
          <Field name="loyaltyEvery" label="Loyalty: every Nth order" value={s.loyaltyEvery} inputMode="numeric" />
          <Field name="loyaltyPercent" label="Loyalty discount %" value={s.loyaltyPercent} inputMode="numeric" />
        </div>
        <Field name="instagram" label="Instagram link" value={s.instagram} inputMode="url" help="e.g. https://instagram.com/josephinecosmetics" />
        <Field name="tiktok" label="TikTok link" value={s.tiktok} inputMode="url" help="e.g. https://tiktok.com/@josephinecosmetics" />
      </section>
      {msg && <p className="text-center text-sm text-gold-light">{msg}</p>}
      <button className="btn btn-pink w-full" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
