import { db } from "@/lib/db";
import { ZonesForm } from "./zones-form";

export default async function DeliveryAdminPage() {
  const zones = await db.deliveryZone.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-gold-light">Delivery areas</h1>
      <p className="text-sm text-muted">
        Customers choose one of these areas at checkout. There are no fixed prices – you agree the delivery fee on WhatsApp and can
        note it on the order.
      </p>
      <ZonesForm zones={zones.map(({ id, name, note, upcountry, active }) => ({ id, name, note, upcountry, active }))} />
    </div>
  );
}
