import { CartProvider } from "@/components/cart";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { waLink } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, s] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    getSettings(),
  ]);
  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
      <Footer s={s} />
      <a
        href={waLink(s.whatsappNumber, "Hello Josephine! I have a question.")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-[#062b14] shadow-lg shadow-black/50"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </CartProvider>
  );
}
