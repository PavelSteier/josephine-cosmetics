import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Returns & refunds" };

export default async function ReturnsPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-2xl pt-10">
      <h1 className="font-display text-3xl text-gold-shine">Returns & refunds</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-semibold text-gold-light">Returns</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>You can return an item within <strong className="text-cream">{s.returnDays} days</strong> after delivery.</li>
            <li>A receipt or proof of purchase (your order number) must be provided.</li>
            <li>Items must be unused, in their original condition and packaging.</li>
            <li>For hygiene reasons, opened cosmetics, worn wigs and earrings cannot be returned unless they are faulty.</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-gold-light">Refunds</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Refunds are paid by <strong className="text-cream">Mobile Money</strong>.</li>
            <li>Delivery fees are non-refundable, unless the return is due to our mistake (wrong or faulty item).</li>
          </ul>
        </section>
        <p>To start a return, message us on WhatsApp with your order number.</p>
      </div>
    </div>
  );
}
