"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card w-full max-w-sm space-y-4 p-6">
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {error && <p className="text-sm text-pink">{error}</p>}
      <button className="btn btn-gold w-full" disabled={pending}>{pending ? "…" : "Log in"}</button>
    </form>
  );
}
