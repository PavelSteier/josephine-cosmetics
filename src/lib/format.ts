export function ugx(amount: number): string {
  return "UGX " + Math.round(amount).toLocaleString("en-US");
}

export function orderNumber(id: number): string {
  return "JC" + (1000 + id);
}

export function parseOrderNumber(input: string): number | null {
  const m = input.trim().toUpperCase().replace(/\s/g, "").match(/^(?:JC)?(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]) - 1000;
  return n > 0 ? n : null;
}

/** Normalise a Ugandan phone number to 2567XXXXXXXX. Returns null if invalid. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "256" + d.slice(1);
  if (d.length === 9 && d.startsWith("7")) d = "256" + d;
  return /^2567\d{8}$/.test(d) ? d : null;
}

/** 256784432471 -> 0784 432 471 */
export function displayPhone(p: string): string {
  const local = p.startsWith("256") ? "0" + p.slice(3) : p;
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const STATUS_LABEL: Record<string, string> = {
  NEW: "Received",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-pink-deep text-white",
  CONFIRMED: "bg-gold/20 text-gold-light",
  OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-200",
  DELIVERED: "bg-emerald-500/20 text-emerald-200",
  CANCELLED: "bg-ink-3 text-muted",
};
