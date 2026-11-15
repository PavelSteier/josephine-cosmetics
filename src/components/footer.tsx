import Link from "next/link";
import { displayPhone, waLink } from "@/lib/format";
import type { Settings } from "@/lib/settings";
import { WhatsAppIcon } from "./icons";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="mt-16 border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl text-gold-shine">Josephine</p>
          <p className="mt-2 text-sm text-muted">
            Cosmetics, clothes, jewelry, heels and wigs. Delivery in Kampala by boda and Faras, upcountry by bus or
            taxi.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-gold-light">Help</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/track" className="hover:text-cream">Track my order</Link></li>
            <li><Link href="/delivery" className="hover:text-cream">Delivery</Link></li>
            <li><Link href="/returns" className="hover:text-cream">Returns & refunds</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-gold-light">Contact</p>
          <a
            href={waLink(s.whatsappNumber, "Hello Josephine!")}
            className="inline-flex items-center gap-2 text-muted hover:text-cream"
          >
            <WhatsAppIcon className="h-4 w-4" /> {displayPhone(s.whatsappNumber)}
          </a>
          <div className="mt-2 flex gap-4 text-muted">
            {s.instagram && <a href={s.instagram} className="hover:text-cream">Instagram</a>}
            {s.tiktok && <a href={s.tiktok} className="hover:text-cream">TikTok</a>}
          </div>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted">© {new Date().getFullYear()} {s.shopName}</p>
    </footer>
  );
}
