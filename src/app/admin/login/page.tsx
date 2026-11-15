import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <p className="font-display text-4xl text-gold-shine">Josephine</p>
      <p className="mb-8 text-xs uppercase tracking-[0.3em] text-pink">Shop admin</p>
      <LoginForm />
    </div>
  );
}
