"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Orders", icon: "🧾", match: ["/admin/orders"] },
  { href: "/admin/products", label: "Products", icon: "👗", match: [] },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐", match: [] },
  { href: "/admin/discounts", label: "Codes", icon: "🏷️", match: [] },
  { href: "/admin/settings", label: "More", icon: "⚙️", match: ["/admin/delivery"] },
];

export function AdminNav({ newOrders, pendingReviews }: { newOrders: number; pendingReviews: number }) {
  const path = usePathname();
  const badge: Record<string, number> = { "/admin": newOrders, "/admin/reviews": pendingReviews };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-ink-2 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ href, label, icon, match }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        const on = active || match.some((m) => path.startsWith(m));
        return (
          <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs ${on ? "text-gold-light" : "text-muted"}`}>
            <span className="text-xl" aria-hidden="true">{icon}</span>
            {label}
            {badge[href] > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1 rounded-full bg-pink-deep px-1.5 text-[10px] font-bold text-white">{badge[href]}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
