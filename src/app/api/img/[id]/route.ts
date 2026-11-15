import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const img = await db.productImage.findUnique({ where: { id }, select: { data: true, mime: true } });
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mime,
      // image ids never change content, so browsers and the CDN can cache forever
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
