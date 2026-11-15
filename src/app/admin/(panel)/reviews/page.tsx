import Link from "next/link";
import { Stars } from "@/components/stars";
import { db } from "@/lib/db";
import { ReviewButtons } from "./buttons";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const showApproved = (await searchParams).f === "approved";
  const reviews = await db.review.findMany({
    where: { approved: showApproved },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true, slug: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-gold-light">Reviews</h1>
      <div className="flex gap-2 text-sm">
        <Link href="/admin/reviews" className={`rounded-full px-3 py-1 ${!showApproved ? "bg-pink-deep text-white" : "border border-line text-muted"}`}>To check</Link>
        <Link href="/admin/reviews?f=approved" className={`rounded-full px-3 py-1 ${showApproved ? "bg-pink-deep text-white" : "border border-line text-muted"}`}>Published</Link>
      </div>
      {!showApproved && <p className="text-sm text-muted">New reviews only appear in the shop after you publish them.</p>}
      <ul className="space-y-2">
        {reviews.map((r) => (
          <li key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {r.name}
                {r.verified && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">✓ Verified buyer</span>}
              </p>
              <Stars rating={r.rating} className="text-sm" />
            </div>
            <Link href={`/p/${r.product.slug}`} target="_blank" className="text-xs text-pink underline">{r.product.name}</Link>
            <p className="mt-2 whitespace-pre-line text-sm text-muted">{r.text}</p>
            <ReviewButtons id={r.id} approved={r.approved} />
          </li>
        ))}
      </ul>
      {reviews.length === 0 && <p className="py-6 text-center text-sm text-muted">Nothing here.</p>}
    </div>
  );
}
