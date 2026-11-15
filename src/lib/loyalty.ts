import { db } from "./db";
import type { Settings } from "./settings";

/** Number of earlier (not cancelled) orders from this phone. */
export async function previousOrderCount(phone: string): Promise<number> {
  return db.order.count({ where: { phone, status: { not: "CANCELLED" } } });
}

/** True when the NEXT order from a customer with `previous` orders gets the loyalty discount. */
export function loyaltyApplies(previous: number, s: Settings): boolean {
  const every = Number(s.loyaltyEvery) || 5;
  return (previous + 1) % every === 0;
}
