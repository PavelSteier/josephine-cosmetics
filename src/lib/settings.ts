import { db } from "./db";

export const DEFAULT_SETTINGS = {
  shopName: "Josephine Cosmetics & Jewelry",
  whatsappNumber: "256784432471",
  momoNumber: "256784432471",
  momoName: "Josephine Babirye",
  merchantCode: "",
  returnDays: "3",
  loyaltyEvery: "5",
  loyaltyPercent: "10",
  instagram: "",
  tiktok: "",
};

export type Settings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
}
