// Admin session: a cookie holding an HMAC signature of an expiry timestamp.
// Works both in middleware (edge) and in server code (Web Crypto).
export const SESSION_COOKIE = "jc_admin";
const MAX_AGE_DAYS = 60;

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET is missing or too short");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionValue(): Promise<{ value: string; maxAge: number }> {
  const maxAge = MAX_AGE_DAYS * 24 * 3600;
  const exp = String(Date.now() + maxAge * 1000);
  return { value: `${exp}.${await hmac(exp)}`, maxAge };
}

export async function verifySessionValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmac(exp);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
