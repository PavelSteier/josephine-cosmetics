import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const MAX_BYTES = 1_500_000; // photos are resized in the browser before upload
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData();
  const productId = Number(form.get("productId"));
  const file = form.get("file");
  if (!Number.isInteger(productId) || !(file instanceof File)) return Response.json({ error: "bad request" }, { status: 400 });
  if (!TYPES.includes(file.type)) return Response.json({ error: "Only JPG, PNG or WebP photos" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Photo is too large" }, { status: 400 });
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return Response.json({ error: "product not found" }, { status: 404 });

  const last = await db.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const img = await db.productImage.create({
    data: { productId, mime: file.type, data: Buffer.from(await file.arrayBuffer()), sortOrder: (last?.sortOrder ?? -1) + 1 },
    select: { id: true },
  });
  revalidatePath("/", "layout");
  return Response.json({ id: img.id });
}
