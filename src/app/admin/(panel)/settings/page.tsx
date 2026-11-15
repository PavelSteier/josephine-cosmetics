import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { displayPhone } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-gold-light">Settings</h1>
      <Link href="/admin/delivery" className="card flex items-center justify-between p-4 hover:border-gold">
        <span>🛵 Delivery areas & prices</span>
        <span className="text-muted">›</span>
      </Link>
      <SettingsForm s={{ ...s, whatsappNumber: displayPhone(s.whatsappNumber), momoNumber: displayPhone(s.momoNumber) }} />
      <div className="card p-4 text-sm text-muted">
        <p className="font-semibold text-gold-light">Tip: add the admin to your home screen</p>
        <p className="mt-1">In Safari tap the Share button → “Add to Home Screen”. It then opens like an app.</p>
      </div>
      <form action={logout}>
        <button className="w-full py-3 text-sm text-muted underline">Log out</button>
      </form>
    </div>
  );
}
