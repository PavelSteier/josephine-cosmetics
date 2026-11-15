import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [zones, s] = await Promise.all([
    db.deliveryZone.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    getSettings(),
  ]);
  return (
    <div className="mx-auto max-w-2xl pt-8">
      <h1 className="font-display text-3xl text-gold-shine">Checkout</h1>
      <CheckoutForm
        zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee, note: z.note, upcountry: z.upcountry }))}
        loyaltyEvery={Number(s.loyaltyEvery) || 5}
      />
    </div>
  );
}
