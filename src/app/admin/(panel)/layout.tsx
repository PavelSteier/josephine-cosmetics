import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Josephine Admin", statusBarStyle: "black-translucent" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newOrders = await db.order.count({ where: { status: "NEW" } });
  return (
    <div className="pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-3 backdrop-blur">
        <Link href="/admin" className="font-display text-xl text-gold-shine">Josephine admin</Link>
        <Link href="/" target="_blank" className="text-xs text-muted underline">View shop</Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-4">{children}</main>
      <AdminNav newOrders={newOrders} />
    </div>
  );
}
