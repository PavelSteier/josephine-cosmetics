"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteProduct, saveProduct } from "./actions";
import { ProductPhotos } from "./product-photos";

type Category = { id: number; name: string; slug: string };
type Variant = { id: number; color: string; size: string; stock: number };
export type EditableProduct = {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  price: number;
  oldPrice: number | null;
  active: boolean;
  featured: boolean;
  variants: Variant[];
  imageIds: number[];
};

const SIZE_PRESETS: Record<string, string[]> = {
  clothes: ["S", "M", "L", "XL", "XXL"],
  heels: ["36", "37", "38", "39", "40", "41"],
  wigs: ['12"', '14"', '16"', '18"', '20"', '24"'],
};

const key = (c: string, s: string) => `${c}|${s}`;
const uniq = (a: string[]) => [...new Set(a.filter(Boolean))];

function ChipInput({ label, values, onChange, placeholder, presets }: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  presets?: string[];
}) {
  const [draft, setDraft] = useState("");
  const addDraft = () => {
    const parts = draft.split(",").map((s) => s.trim());
    onChange(uniq([...values, ...parts]));
    setDraft("");
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button key={v} type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="rounded-full border border-gold/60 px-3 py-1 text-sm">
            {v} <span className="text-muted">✕</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={placeholder}
          className="input"
        />
        <button type="button" onClick={addDraft} className="btn btn-outline shrink-0 px-4">Add</button>
      </div>
      {presets && (
        <button type="button" onClick={() => onChange(uniq([...values, ...presets]))} className="mt-2 text-xs text-gold-light underline">
          + Add usual sizes ({presets.join(", ")})
        </button>
      )}
    </div>
  );
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: EditableProduct }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState<number>(product?.categoryId ?? categories[0]?.id ?? 0);
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(product?.oldPrice ? String(product.oldPrice) : "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [colors, setColors] = useState<string[]>(uniq(product?.variants.map((v) => v.color) ?? []));
  const [sizes, setSizes] = useState<string[]>(uniq(product?.variants.map((v) => v.size) ?? []));
  const [stock, setStock] = useState<Record<string, string>>(
    Object.fromEntries((product?.variants ?? []).map((v) => [key(v.color, v.size), String(v.stock)])),
  );
  const ids = useMemo(
    () => Object.fromEntries((product?.variants ?? []).map((v) => [key(v.color, v.size), v.id])),
    [product],
  );

  const category = categories.find((c) => c.id === categoryId);
  const combos = useMemo(() => {
    const cs = colors.length ? colors : [""];
    const ss = sizes.length ? sizes : [""];
    return cs.flatMap((c) => ss.map((s) => ({ color: c, size: s })));
  }, [colors, sizes]);

  const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

  function submit() {
    setError("");
    setSaved(false);
    start(async () => {
      const r = await saveProduct({
        id: product?.id,
        name,
        description,
        categoryId,
        price: num(price),
        oldPrice: oldPrice ? num(oldPrice) : null,
        active,
        featured,
        variants: combos.map((c) => ({
          id: ids[key(c.color, c.size)],
          color: c.color,
          size: c.size,
          stock: num(stock[key(c.color, c.size)] ?? "0"),
        })),
      });
      if (!r.ok) return setError(r.error);
      setSaved(true);
      if (!product) router.replace(`/admin/products/${r.id}?created=1`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {product && <ProductPhotos productId={product.id} imageIds={product.imageIds} name={product.name} />}

      <section className="card space-y-4 p-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Gold hoop earrings" />
        </div>
        <div>
          <label className="label" htmlFor="cat">Category</label>
          <select id="cat" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="input">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="price">Price (UGX)</label>
            <input id="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="45000" />
          </div>
          <div>
            <label className="label" htmlFor="old">Old price (optional)</label>
            <input id="old" inputMode="numeric" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="input" placeholder="for sales" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="desc">Description</label>
          <textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Material, how to use, what's included…" />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-[#e0558f]" />
          Show in shop
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5 accent-[#e0558f]" />
          Josephine&apos;s pick (show on home page)
        </label>
      </section>

      <section className="card space-y-4 p-4">
        <h2 className="font-semibold text-gold-light">Colours, sizes & stock</h2>
        <ChipInput label="Colours (optional)" values={colors} onChange={setColors} placeholder="e.g. Black, Pink" />
        <ChipInput
          label="Sizes (optional)"
          values={sizes}
          onChange={setSizes}
          placeholder="e.g. 38 or M"
          presets={category ? SIZE_PRESETS[category.slug] : undefined}
        />
        <div>
          <span className="label">How many do you have?</span>
          <div className="space-y-2">
            {combos.map((c) => {
              const k = key(c.color, c.size);
              const label = [c.color, c.size].filter(Boolean).join(" · ") || "In stock";
              return (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{label}</span>
                  <input
                    inputMode="numeric"
                    value={stock[k] ?? ""}
                    onChange={(e) => setStock((s) => ({ ...s, [k]: e.target.value }))}
                    className="input w-24 text-center"
                    placeholder="0"
                    aria-label={`Stock for ${label}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl border border-pink-deep bg-pink-deep/10 p-3 text-sm">{error}</p>}
      {saved && <p className="text-center text-sm text-gold-light">✓ Saved</p>}

      <button type="button" onClick={submit} disabled={pending} className="btn btn-pink w-full">
        {pending ? "Saving…" : product ? "Save changes" : "Create product, then add photos"}
      </button>

      {product && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this product? (If it was ever ordered, it will only be hidden.)")) return;
            start(async () => {
              await deleteProduct(product.id);
              router.replace("/admin/products");
            });
          }}
          className="w-full py-3 text-sm text-pink"
        >
          Delete product
        </button>
      )}
    </div>
  );
}
