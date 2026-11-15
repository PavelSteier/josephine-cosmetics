import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Delivery & prices" };

export default async function DeliveryPage() {
  const zones = await db.deliveryZone.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="mx-auto max-w-2xl pt-10">
      <h1 className="font-display text-3xl text-gold-shine">Delivery & prices</h1>
      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
        <p>In Kampala and nearby we deliver by <strong className="text-cream">boda boda and Faras</strong>. Upcountry orders are sent by <strong className="text-cream">bus or taxi</strong> and you pick them up at the park in your town.</p>
        <p>When we are not too busy, Kampala orders can arrive <strong className="text-cream">the same day</strong>. We confirm the delivery time with you on WhatsApp.</p>
      </div>
      <table className="card mt-6 w-full overflow-hidden text-sm">
        <thead>
          <tr className="border-b border-line text-left text-gold-light">
            <th className="p-3 font-semibold">Area</th>
            <th className="p-3 text-right font-semibold">Delivery fee</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.id} className="border-b border-line last:border-0">
              <td className="p-3">
                {z.name}
                {z.note && <span className="block text-xs text-muted">{z.note}</span>}
              </td>
              <td className="p-3 text-right">{ugx(z.fee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
