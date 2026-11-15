import type { Metadata } from "next";
import { TrackForm } from "./track-form";

export const metadata: Metadata = { title: "Track my order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-md pt-10">
      <h1 className="font-display text-3xl text-gold-shine">Track my order</h1>
      <p className="mt-2 text-sm text-muted">Enter your order number and the phone number you used.</p>
      <TrackForm />
    </div>
  );
}
