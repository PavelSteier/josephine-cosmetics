import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-5xl text-gold-shine">Oops</p>
      <p className="text-muted">This page doesn&apos;t exist.</p>
      <Link href="/" className="btn btn-pink">Back to the shop</Link>
    </div>
  );
}
