"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type State = "loading" | "unsupported" | "needs-home-screen" | "off" | "on" | "denied" | "disabled";

export function PushToggle({ enabled }: { enabled: boolean }) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!enabled) return setState("disabled");
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return setState(isIOS && !standalone ? "needs-home-screen" : "unsupported");
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, [enabled]);

  async function turnOn() {
    setBusy(true);
    setError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const r = await fetch("/api/admin/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      if (!r.ok) throw new Error("Could not save");
      setState("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/admin/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setState("off");
    setBusy(false);
  }

  if (state === "loading" || state === "disabled") return null;

  return (
    <section className="card p-4 text-sm">
      <p className="font-semibold text-gold-light">🔔 New order notifications</p>
      {state === "needs-home-screen" && (
        <p className="mt-1 text-muted">
          First add the admin to your home screen: in Safari tap Share → “Add to Home Screen”. Then open it from the home screen and
          come back here.
        </p>
      )}
      {state === "unsupported" && <p className="mt-1 text-muted">This browser can’t show notifications.</p>}
      {state === "denied" && (
        <p className="mt-1 text-muted">Notifications are blocked. Allow them in iPhone Settings → Notifications → Josephine.</p>
      )}
      {state === "off" && (
        <>
          <p className="mt-1 text-muted">Get a message on this phone for every new order, even when the app is closed.</p>
          <button type="button" onClick={turnOn} disabled={busy} className="btn btn-gold mt-3 w-full">
            {busy ? "…" : "Turn on notifications"}
          </button>
        </>
      )}
      {state === "on" && (
        <>
          <p className="mt-1 text-muted">✓ On for this phone.</p>
          <button type="button" onClick={turnOff} disabled={busy} className="mt-2 text-xs text-muted underline">
            Turn off
          </button>
        </>
      )}
      {error && <p className="mt-2 text-pink">{error}</p>}
    </section>
  );
}
