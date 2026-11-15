# Spuštění e-shopu na internetu (zdarma)

Celkem asi 20 minut klikání. Platíš jen doménu (volitelná, lze přidat později).

## 1. GitHub – kód
Kód musí být v GitHub repozitáři (soukromém). Buď ho nahraje Claude po propojení GitHubu
(https://claude.ai/connect-github), nebo ručně ze souboru `josephine-shop.bundle`:

```bash
git clone josephine-shop.bundle josephine-shop
cd josephine-shop
git remote set-url origin https://github.com/TVUJ-UZIVATEL/josephine-shop.git
git push -u origin main
```

## 2. Supabase – databáze
1. Zaregistruj se na https://supabase.com (přihlášení přes GitHub je nejrychlejší).
2. **New project** → název `josephine-shop`, vymysli a ulož si **Database password**,
   region **Central EU (Frankfurt)** (Vercel je nastavený také na Frankfurt).
3. Po vytvoření klikni nahoře na **Connect** → záložka **ORMs** → **Prisma**.
   Uvidíš dva řádky – zkopíruj je (a místo `[YOUR-PASSWORD]` vlož heslo z bodu 2):
   - `DATABASE_URL` (port **6543**, končí `?pgbouncer=true`)
   - `DIRECT_URL` (port **5432**)

## 3. Vercel – hosting
1. Zaregistruj se na https://vercel.com přes GitHub (tarif **Hobby** = zdarma).
2. **Add New → Project** → vyber repozitář `josephine-shop` → **Import**.
3. Rozbal **Environment Variables** a vlož (hodnoty pro řádky 3–6 máš v souboru
   `josephine-shop-tajne-klice.txt`, který ti poslal Claude – ten NEDÁVEJ na GitHub):

| Name | Value |
|---|---|
| `DATABASE_URL` | z Supabase (6543) |
| `DIRECT_URL` | z Supabase (5432) |
| `ADMIN_PASSWORD` | heslo do adminu pro Josephine, min. 10 znaků |
| `SESSION_SECRET` | ze souboru s klíči |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ze souboru s klíči |
| `VAPID_PRIVATE_KEY` | ze souboru s klíči |
| `NEXT_PUBLIC_SITE_URL` | zatím nech prázdné, doplníš v kroku 4 |

4. **Deploy**. Build sám vytvoří tabulky, kategorie a doručovací oblasti (bez ukázkových produktů).
5. Vercel ti dá adresu typu `https://josephine-shop-xxxx.vercel.app`. Vlož ji do
   `NEXT_PUBLIC_SITE_URL` (Settings → Environment Variables) a dej **Deployments → … → Redeploy**.

## 4. Josephine
1. Na iPhonu v Safari otevři `https://…/admin`, přihlas se heslem `ADMIN_PASSWORD`.
2. Sdílet → **Přidat na plochu**. Otevři admin z plochy → **More** → **Turn on notifications**.
3. Pošli jí návod `docs/JOSEPHINE-GUIDE.md`.

## 5. Doména (až bude)
Kup doménu (např. Namecheap / Porkbun), ve Vercelu **Settings → Domains → Add** a nastav DNS
podle instrukcí Vercelu. Pak změň `NEXT_PUBLIC_SITE_URL` na novou adresu a dej Redeploy.

## Když něco nejde
- Build spadne na databázi → zkontroluj heslo v `DATABASE_URL` / `DIRECT_URL`.
- Do adminu to nepustí s hláškou o hesle → `ADMIN_PASSWORD` musí mít aspoň 10 znaků.
- Supabase zdarma uspí projekt po 7 dnech **bez jakékoli návštěvy** – běžící obchod se to netýká.
