import { db } from "@/lib/db";
import { ugx } from "@/lib/format";
import { CodeActions, NewCodeForm } from "./forms";

export default async function DiscountsPage() {
  const codes = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-gold-light">Discount codes</h1>
      <p className="text-sm text-muted">
        Share a code on Instagram or TikTok, e.g. <strong className="text-cream">WELCOME10</strong>. Customers type it at checkout.
        It does not add up with the loyalty reward – the customer gets the bigger one.
      </p>
      <NewCodeForm />
      <ul className="space-y-2">
        {codes.map((c) => {
          const expired = c.expiresAt && c.expiresAt < now;
          const usedUp = c.maxUses !== null && c.usedCount >= c.maxUses;
          const live = c.active && !expired && !usedUp;
          return (
            <li key={c.id} className={`card p-4 ${live ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-semibold tracking-wider text-gold-light">{c.code}</p>
                  <p className="text-sm">{c.type === "PERCENT" ? `${c.value}% off` : `${ugx(c.value)} off`}{c.minOrder > 0 && ` · min. ${ugx(c.minOrder)}`}</p>
                  <p className="text-xs text-muted">
                    Used {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""} times
                    {c.expiresAt && ` · ${expired ? "expired" : "until"} ${c.expiresAt.toLocaleDateString("en-GB", { timeZone: "Africa/Kampala" })}`}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${live ? "bg-emerald-500/20 text-emerald-200" : "bg-ink-3 text-muted"}`}>
                  {live ? "Active" : expired ? "Expired" : usedUp ? "Used up" : "Off"}
                </span>
              </div>
              <CodeActions id={c.id} active={c.active} />
            </li>
          );
        })}
      </ul>
      {codes.length === 0 && <p className="py-6 text-center text-sm text-muted">No codes yet.</p>}
    </div>
  );
}
