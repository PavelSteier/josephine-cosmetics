import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { VariantPicker } from "@/components/variant-picker";
import { db } from "@/lib/db";
import { ugx } from "@/lib/format";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
      variants: { orderBy: { id: "asc" } },
      images: { select: { id: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const description = (p.description || `${p.name} – ${ugx(p.price)}`).slice(0, 160);
  return {
    title: p.name,
    description,
    openGraph: { title: p.name, description, images: p.images[0] ? [`/api/img/${p.images[0].id}`] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const s = await getSettings();
  const inStock = p.variants.some((v) => v.stock > 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((i) => `${siteUrl}/api/img/${i.id}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "UGX",
      price: p.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="grid gap-8 pt-6 md:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductGallery imageIds={p.images.map((i) => i.id)} name={p.name} />
      <div>
        <Link href={`/c/${p.category.slug}`} className="text-xs uppercase tracking-[0.25em] text-pink">
          {p.category.name}
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cream">{p.name}</h1>
        <p className="mt-3 text-2xl">
          <span className="font-semibold text-gold-light">{ugx(p.price)}</span>
          {p.oldPrice && p.oldPrice > p.price && (
            <span className="ml-3 text-base text-muted line-through">{ugx(p.oldPrice)}</span>
          )}
        </p>

        <VariantPicker
          product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, imageId: p.images[0]?.id ?? null }}
          variants={p.variants.map((v) => ({ id: v.id, color: v.color, size: v.size, stock: v.stock }))}
          whatsappNumber={s.whatsappNumber}
          productUrl={`${siteUrl}/p/${p.slug}`}
        />

        {p.description && (
          <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-muted">{p.description}</div>
        )}
        <ul className="mt-8 space-y-1 text-sm text-muted">
          <li>🛵 Delivery in Kampala by boda / Faras, upcountry by bus or taxi – <Link href="/delivery" className="underline">prices</Link></li>
          <li>📱 Pay with MTN Mobile Money or cash on delivery</li>
          <li>↩️ Returns within {s.returnDays} days – <Link href="/returns" className="underline">details</Link></li>
        </ul>
      </div>
    </div>
  );
}
