import { displayPhone, orderNumber, ugx } from "./format";

type OrderLike = {
  id: number;
  customerName: string;
  phone: string;
  zoneName: string;
  address: string;
  note: string;
  paymentMethod: "MOMO" | "CASH";
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
};

export function orderSummaryText(o: OrderLike): string {
  const lines = o.items.map((i) => {
    const v = [i.color, i.size].filter(Boolean).join(", ");
    return `• ${i.name}${v ? ` (${v})` : ""} ×${i.qty} – ${ugx(i.price * i.qty)}`;
  });
  return [
    `Order ${orderNumber(o.id)}`,
    ...lines,
    o.discount ? `Loyalty discount: −${ugx(o.discount)}` : "",
    `Delivery (${o.zoneName}): ${ugx(o.deliveryFee)}`,
    `TOTAL: ${ugx(o.total)}`,
    `Payment: ${o.paymentMethod === "MOMO" ? "MTN Mobile Money" : "Cash on delivery"}`,
    `Name: ${o.customerName}`,
    `Phone: ${displayPhone(o.phone)}`,
    `Deliver to: ${o.address}`,
    o.note ? `Note: ${o.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
