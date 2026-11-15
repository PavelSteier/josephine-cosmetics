import { db } from "@/lib/db";
import { ZonesForm } from "./zones-form";

export default async function DeliveryAdminPage() {
  const zones = await db.deliveryZone.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-gold-light">Delivery areas & prices</h1>
      <p className="text-sm text-muted">Customers choose one of these areas at checkout and the price is added to the order.</p>
      <ZonesForm zones={zones.map(({ id, name, fee, note, upcountry, active }) => ({ id, name, fee: String(fee), note, upcountry, active }))} />
    </div>
  );
}
