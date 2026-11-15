"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/admin", "Orders", "🧾"],
  ["/admin/products", "Products", "👗"],
  ["/admin/delivery", "Delivery", "🛵"],
  ["/admin/settings", "Settings", "⚙️"],
] as const;

export function AdminNav({ newOrders }: { newOrders: number }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-ink-2 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(([href, label, icon]) => {
        const active = href === "/admin" ? path === "/admin" || path.startsWith("/admin/orders") : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs ${active ? "text-gold-light" : "text-muted"}`}>
            <span className="text-xl" aria-hidden="true">{icon}</span>
            {label}
            {href === "/admin" && newOrders > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1 rounded-full bg-pink-deep px-1.5 text-[10px] font-bold text-white">{newOrders}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
