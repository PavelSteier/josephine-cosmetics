import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-4">
      <Link href="/admin/products" className="text-sm text-muted">← Products</Link>
      <h1 className="font-display text-2xl text-gold-light">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
