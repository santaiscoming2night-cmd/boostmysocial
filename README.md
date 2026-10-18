# Boost My Social — Next.js + Supabase

A complete rebuild of the **Boost My Social** SMM panel on **Next.js 15** (App Router) and **Supabase** (Postgres + Auth). The public site, dashboard, order flow, tickets, service catalogue, admin panel and panel API behave like the original PHP application and reuse its `regular` theme assets.

The original CodeIgniter application is kept in [`legacy/`](legacy) for reference only. It is excluded from Vercel deployments and is never executed.

---

## Contents

- [Deploy in 10 minutes](#deploy-in-10-minutes)
- [Stack and requirements](#stack-and-requirements)
- [Project structure](#project-structure)
- [1. Create the Supabase project](#1-create-the-supabase-project)
- [2. Apply the database migrations](#2-apply-the-database-migrations)
- [3. Configure authentication](#3-configure-authentication)
- [4. Environment variables](#4-environment-variables)
- [5. Deploy to Vercel](#5-deploy-to-vercel)
- [6. First administrator](#6-first-administrator)
- [7. Post-deploy checklist](#7-post-deploy-checklist)
- [Local development](#local-development)
- [Importing users from the old panel](#importing-users-from-the-old-panel)
- [Panel API](#panel-api)
- [How money movements work](#how-money-movements-work)
- [Routes](#routes)
- [Day-to-day operations](#day-to-day-operations)
- [Security notes](#security-notes)
- [Feature parity and differences](#feature-parity-and-differences)
- [Troubleshooting](#troubleshooting)

---

## Deploy in 10 minutes

For people who just want the steps:

1. Create a project at [database.new](https://database.new).
2. In **SQL Editor**, run `supabase/migrations/0001_schema.sql` → `0005_api.sql` in order.
3. In **Authentication → URL Configuration**, set the Site URL and add `/auth/callback` to the redirect URLs.
4. Push this repository to GitHub and import it in Vercel.
5. Add the four environment variables from [.env.example](.env.example) to Vercel.
6. Deploy, then sign up — the first account becomes the administrator.

The sections below explain each step, plus the parts that need care in production.

## Stack and requirements

| Piece | Version / notes |
|---|---|
| Next.js | 15 (App Router, React 19, server actions) |
| Database & auth | Supabase (Postgres 15+, Supabase Auth) |
| Styling | The original Tabler-based `regular` theme CSS, served from `public/` |
| Node.js | 18.18 or newer; 20 or 22 recommended (Vercel default is fine) |
| Accounts | Supabase (free tier is fine to start) and Vercel (Hobby for testing; commercial use requires a paid plan) |

No PHP, Apache, cron or server-side extensions are required.

## Project structure

```
src/app                     Routes, layouts and server actions
  (site)                    Landing page, services, FAQ, news, custom pages
  (auth)                    Login, signup, forgot/reset password
  (dash)                    Dashboard, orders, tickets, admin panel
  api/v1                    Panel API (POST)
  api/subscribe             Newsletter form endpoint
  auth/callback             Supabase email/OAuth callback
  actions/                  Server actions (auth, dashboard, admin)
src/components              Shared UI (dashboard shell, flash messages, forms)
src/lib                     Supabase clients, auth guards, settings, formatting
supabase/migrations         SQL: schema, functions, RLS, seed, API support
public/assets               Original CSS, JS, fonts, images, plugins
public/themes/regular       Original theme stylesheet and images
legacy                      Original PHP application (reference only, not deployed)
scripts                     Optional helpers (legacy user import)
```

---

## 1. Create the Supabase project

1. Go to [database.new](https://database.new) (or **New project** in the Supabase dashboard).
2. Pick an organisation, a name, a strong database password and the region closest to your users.
3. Wait for provisioning to finish.
4. Open **Project Settings → API** (or **API Keys**) and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / publishable key** → `SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> The service-role key can read and write every row and bypasses Row Level Security. It must only ever exist in server-side environment variables.

Both the legacy JWT keys (`anon`, `service_role`) and the newer `sb_publishable_…` / `sb_secret_…` keys work with the installed Supabase client.

## 2. Apply the database migrations

The schema lives in `supabase/migrations` and must be applied **in numeric order**:

| File | What it does |
|---|---|
| `0001_schema.sql` | Tables: profiles, settings, categories, services, orders, transactions, deposits, tickets, content |
| `0002_functions.sql` | First-admin trigger, `place_order`, `request_deposit`, `admin_approve_deposit`, `admin_update_order`, `admin_adjust_balance` |
| `0003_rls.sql` | Row Level Security policies, grants, order-cancellation RPC |
| `0004_seed.sql` | Catalogue and settings from the old panel (91 categories, 98 services), payment methods, 3 FAQs and 2 legal pages |
| `0005_api.sql` | `api_place_order`, `rotate_api_key` |

### Option A — Supabase SQL Editor (no tooling)

1. Open **SQL Editor → New query**.
2. Paste the contents of `0001_schema.sql`, click **Run**.
3. Repeat for `0002`, `0003`, `0004`, `0005`, in that order.

`0004_seed.sql` is the largest file (about 62 KB); paste it whole and run it once.

### Option B — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF   # found in Project Settings → General
npx supabase db push
```

The repository already contains `supabase/config.toml`. The CLI prompts for the database password you chose in step 1.

### Verify

Run this in the SQL editor:

```sql
select
  (select count(*) from public.categories) as categories,
  (select count(*) from public.services)   as services,
  (select count(*) from public.settings)   as settings;
```

Expected: 91 categories, 98 services, 76 settings rows.

> Re-running `0004_seed.sql` after launch will overwrite settings you changed in **Admin → Settings** (categories and services are left alone). On production, prefer `npx supabase db push`; it tracks applied migrations and will not re-run them.

## 3. Configure authentication

In the Supabase dashboard:

1. **Authentication → URL Configuration**
   - **Site URL**: your production URL, e.g. `https://boostmysocial.com`
   - **Redirect URLs**: add
     - `https://boostmysocial.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://your-preview-domain.vercel.app/auth/callback` if you use Vercel preview deployments
2. **Authentication → Providers → Email**
   - Keep Email enabled. Email + password is the only sign-in method the panel uses.
   - **Confirm email**: **off**. New accounts are intentionally created with instant access; the panel does not put users through an email-verification step.
3. **Authentication → Emails / SMTP**
   - SMTP is only needed for password-recovery emails. Configure your own provider (Resend, Postmark, SES, Mailgun, …) if you want production password resets.

Password-reset links are routed through `/auth/callback`, which exchanges the code for a session and then sends the user to the reset form. When `SUPABASE_SERVICE_ROLE_KEY` is present, the signup action explicitly marks a new email as confirmed so instant access still works if the hosted project's setting was missed.

If `SITE_URL` is not set, the app derives the callback origin from the incoming request, so password recovery emails still work — but setting it explicitly is strongly recommended.

## 4. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env
```

| Variable | Exposed to browser | Used for |
|---|---|---|
| `SUPABASE_URL` | **No** | Server-side Supabase REST/Auth endpoint |
| `SUPABASE_ANON_KEY` | **No** | Server clients using the user session; RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Reading settings, admin panel operations, the panel API, newsletter inserts |
| `SITE_URL` | **No** (URL displayed in API docs) | Auth email redirects and the API endpoint shown on `/api/docs` |

When migrating an existing deployment, remove `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` from hosting settings and replace them with the names above. Redeploy to replace previously published browser bundles. Rotate any service-role key that was ever exposed publicly.

Rules of thumb:

- `.env` is git-ignored. Never commit real keys.
- No environment variables need a `NEXT_PUBLIC_` prefix. Supabase calls run on the server, including order submission. The site URL is displayed where needed but no credentials are passed to the browser.
- Never prefix the service-role key with `NEXT_PUBLIC_` and never import it into a client component.
- `SITE_URL` should have **no trailing slash**, e.g. `https://boostmysocial.com`.

For Vercel, add the same four variables under **Project → Settings → Environment Variables** for **Production** (and **Preview** if you use preview deployments).

## 5. Deploy to Vercel

1. Push the repository to GitHub (this branch or `main` after merging).
2. In Vercel choose **Add New → Project** and import the repository.
3. Vercel detects **Next.js** automatically. Leave the defaults:
   - Framework preset: **Next.js**
   - Root directory: **repository root** (do *not* point it at `legacy`)
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output: `.next` (automatic)
4. Open **Environment Variables** and add all four variables from [.env.example](.env.example). Select Production (and Preview if needed).
5. Click **Deploy**. The first build takes a couple of minutes.
6. When the deployment is ready, open **Settings → Domains** to attach your domain, then update:
   - `SITE_URL` in Vercel to `https://your-domain.com`
   - Supabase **Site URL** and **Redirect URLs** to the same domain
   - Restart or redeploy after changing environment variables.

Notes:

- `legacy/` (65 MB of PHP) is listed in `.vercelignore`, so it is not uploaded.
- Static assets in `public/` are served by Vercel's CDN; no extra configuration is needed.
- Vercel runs the app as serverless/edge functions. There is no cron job to configure — see [Feature parity and differences](#feature-parity-and-differences).
- Vercel's Hobby plan is intended for personal and testing use; a commercial panel needs a paid Vercel plan.
- Supabase's free plan pauses projects after a period of inactivity; a paid plan avoids cold starts and pausing.

### Self-hosting instead of Vercel

Any Node 18.18+ host works:

```bash
npm ci
npm run build
npm start            # listens on 0.0.0.0:3000 by default (set PORT to override)
```

Put it behind HTTPS (Nginx, Caddy, Cloudflare Tunnel), keep the four environment variables set, and point `SITE_URL` at the public HTTPS URL.

## 6. First administrator

After the migrations, `public.profiles` is empty. The **first account that signs up becomes the administrator** (a trigger on `auth.users`); every later signup is a normal user.

1. Open `/signup` and create your account.
2. Go to `/admin/orders` — if it loads, the admin role is active.
3. Optionally disable public registration afterwards in **Admin → Settings → Disable signup page**.

To promote someone later:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## 7. Post-deploy checklist

- [ ] Landing page loads with your logo and no yellow "Supabase is not configured" banner.
- [ ] `/faq` and `/page/terms` render seeded content; `/news` loads (empty until you publish something).
- [ ] `/services` lists the catalogue (public by default; change in Admin → Settings).
- [ ] Signup opens the dashboard immediately, with no confirmation-email step.
- [ ] Admin can open `/admin/orders`, `/admin/users`, `/admin/deposits`.
- [ ] Placing an order deducts the balance and writes a transaction record.
- [ ] Requesting a deposit creates a pending request; approving it credits the balance exactly once.
- [ ] `/api/docs` shows your real domain and the API key from `/profile`.
- [ ] `curl` against `/api/v1` with `action=balance` returns your balance.
- [ ] Password reset email arrives and lands on `/reset-password`.

---

## Local development

```bash
npm install
cp .env.example .env     # then fill in your Supabase keys
npm run dev                    # http://localhost:3000
```

Production build locally:

```bash
npm run build
npm start
```

You can run the app **without** Supabase keys: pages render with built-in default settings and a yellow setup banner appears on the public site. Anything that needs the database (login, dashboard, admin) is unavailable until the keys are configured.

Useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `node scripts/import-legacy-users.mjs` | Generate SQL to import old panel users (see below) |

ESLint is not configured in this project; `next build` does not run linting.

## Importing users from the old panel

The catalogue, settings and content are already seeded from the old MySQL dump (91 categories, 98 services, 76 settings, 3 FAQs and the Terms/Cookie pages). Users, orders and tickets are not copied automatically.

Existing users *can* keep their passwords: Supabase Auth verifies bcrypt hashes and the old panel stored bcrypt hashes.

1. Keep the dump at `legacy/dlititci_boostmysocial2.sql`.
2. Generate the SQL:

   ```bash
   node scripts/import-legacy-users.mjs
   ```

3. Open `scripts/output/legacy-users.sql` and run it in the Supabase SQL editor **after** `0001`–`0005`.
4. Verify you can sign in with an old account, then delete the generated file.

The script copies names, role, status, balance, spent, timezone and API keys. The output contains password hashes and is git-ignored (`scripts/output/`).

To start clean instead, just skip this step and create the admin through `/signup`.

## Panel API

Endpoint: `POST https://your-domain.com/api/v1`

Authentication is the user's API key, shown on `/profile` and `/api/docs`. Requests may be form-encoded (like the old panel) or JSON.

| Action | Parameters | Returns |
|---|---|---|
| `services` | — | Array of active services |
| `add` | `service`, `link`, `quantity` | `{ "order": 123, "charge": "1.5000" }` |
| `status` | `order` **or** `orders` (comma-separated) | One object or an array |
| `balance` | — | `{ "balance": "25.0000", "currency": "USD" }` |

```bash
# List services
curl -X POST https://your-domain.com/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=services"

# Place an order
curl -X POST https://your-domain.com/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=add" \
  -d "service=1" -d "link=https://instagram.com/p/xxxx" -d "quantity=1000"

# Status of one order
curl -X POST https://your-domain.com/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=status" -d "order=100"

# Status of several orders
curl -X POST https://your-domain.com/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=status" -d "orders=100,101,102"

# Balance
curl -X POST https://your-domain.com/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=balance"
```

JSON bodies work too:

```bash
curl -X POST https://your-domain.com/api/v1 \
  -H "content-type: application/json" \
  -d '{"key":"YOUR_API_KEY","action":"balance"}'
```

Errors are returned as `{"error":"message"}` with an HTTP status:

| Status | Meaning |
|---|---|
| 400 | Missing parameters, unknown action, or a business-rule error such as `insufficient_funds`, `quantity_below_min`, `quantity_above_max` |
| 401 | Missing or invalid API key |
| 403 | The account is blocked |
| 404 | Order not found (or not owned by the key's account) |
| 405 | `GET` request — use `POST` |
| 500 | The server has no Supabase configuration |

Order status strings are returned in the panel's own vocabulary, capitalised (`Active`, `In progress`, `Partial`, …). There is no built-in rate limiting; use Vercel Firewall or a proxy if you need it.

## How money movements work

Balances only change inside Postgres functions. They are `SECURITY DEFINER`, check the caller themselves, and run in a single transaction, so simultaneous orders cannot overdraw an account.

| Function | Behaviour |
|---|---|
| `place_order(service_id, link, quantity, note, type)` | Validates the service and min/max, applies the user's custom rate when one exists, locks the profile row, deducts the charge, creates the order and a ledger entry |
| `request_deposit(method_id, amount, reference)` | Validates min/max and applies any configured bonus, creating a `pending` request |
| `admin_approve_deposit(request_id, approve)` | Credits the balance exactly once (repeat approvals return `already_processed`) |
| `admin_update_order(order_id, status, start_count, remains)` | Refunds the full charge on `canceled`/`refunded`, and the undelivered share on `partial` |
| `admin_adjust_balance(user_id, amount, note)` | Manual credit or debit with a ledger entry |
| `api_place_order(...)` | Same as `place_order`, called by the API on behalf of the key's owner |

Pricing follows the original rule: **charge = price × quantity ÷ 1000**, where `user_service_prices` overrides the public price.

## Routes

| Area | Paths |
|---|---|
| Public | `/`, `/services`, `/faq`, `/news`, `/page/[slug]`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/logout` |
| Dashboard | `/dashboard`, `/order/add`, `/order/log`, `/dripfeed`, `/subscriptions`, `/transactions`, `/add-funds`, `/tickets`, `/tickets/new`, `/tickets/[id]`, `/api/docs`, `/profile` |
| Admin | `/admin`, `/admin/orders`, `/admin/users`, `/admin/deposits`, `/admin/subscribers`, `/admin/services`, `/admin/categories`, `/admin/providers`, `/admin/content`, `/admin/tickets`, `/admin/tickets/[id]`, `/admin/settings` |
| API | `POST /api/v1`, `POST /api/subscribe` |

Legacy paths such as `/terms` redirect to `/page/terms` (see `next.config.mjs`).

## Day-to-day operations

**Change site name, logo, currency, social links or feature switches** — **Admin → Settings**. Values are stored in the `settings` table and cached per request.

**Edit FAQs, news and legal pages** — **Admin → Content**.

**Manage orders** — **Admin → Orders**. Updating a status to `canceled` or `refunded` refunds automatically; `partial` refunds based on `remains`.

**Approve deposits** — **Admin → Deposits**. Manual bank transfer is the default enabled method; its instructions come from `payment_methods.config`.

**Rotate a user's API key**:

```sql
update public.profiles
set api_key = replace(gen_random_uuid()::text, '-', '')
where email = 'user@example.com';
```

**Rotate the service-role key** — Supabase **Project Settings → API Keys** (create a new secret and revoke the old one, or rotate the legacy JWT). Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel and redeploy. *Rotating the JWT secret signs everyone out.*

**Backups** — enable Supabase **Database → Backups** (plan-dependent), or take your own:

```bash
# connection string: Supabase → Database → Connection string
pg_dump "$DATABASE_URL" --no-owner --no-privileges > backup-$(date +%F).sql
```

Restore into a fresh Supabase project, then re-run `0003_rls.sql` if you used `--no-privileges`.

**Schema changes** — never edit a migration that has already been applied. Add `supabase/migrations/0006_description.sql`, commit it, then run `npx supabase db push`.

**Monitoring** — Vercel → Deployment → Logs for server errors; Supabase → Logs for database and auth events.

## Security notes

- Row Level Security is enabled on every table. Anonymous visitors can read active services, categories, FAQs, news and published pages only; users see only their own profile, orders, transactions, deposits and tickets.
- The service-role key is used only in server components, server actions and route handlers. It is never sent to the browser.
- Admin server actions re-check the signed-in user's role before every privileged operation, even though the UI already hides admin pages.
- Email/password handling is delegated to Supabase Auth; passwords are hashed and never stored in the `profiles` table.
- Signup enforces a minimum password length of 8 in the app; adjust the Supabase auth policy if you need more.
- API keys are 32-character random strings (hex for new accounts, alphanumeric for imported legacy users) and can be rotated per user with the SQL above.
- Blocked accounts (`profiles.status = 0`) are signed out at login and rejected by the API.
- Keep dependencies patched: `npm audit` and `npm outdated` regularly. This project pins only Next.js, React and the Supabase client.

## Feature parity and differences

Present and working like the old panel: landing page and content pages, signup/login/password reset, statistics dashboard, single order placement, order logs with filters and cancel requests, dripfeed/subscription records, services catalogue with per-user pricing, add funds, transactions, tickets, profile, panel API, and the full admin area.

Deliberate differences:

- **Payments** — the old install embedded live gateway keys. Here the default flow is **manual deposit → admin approval**. `payment_methods` rows exist for Paystack, PayPal and Stripe (disabled, empty keys) so a gateway can be added later.
- **Upstream providers** — the PHP panel used cron workers to forward orders to providers. This build stores orders as `pending` and lets you manage them in **Admin → Orders**, or update them from your own worker.
- **Not re-implemented** — mass orders, dripfeed/subscription creation forms, the file manager, the translation editor, the module marketplace and the `monoka`/`pergo` themes. Their database fields and listing screens remain where relevant.
- **Email** — Supabase Auth is used only for password recovery. Signup is immediate and does not require email confirmation.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Yellow "Supabase is not configured" banner | `SUPABASE_URL` / `SUPABASE_ANON_KEY` are missing. Restart `npm run dev` after editing `.env`. |
| Site shows the default logo and title | `SUPABASE_SERVICE_ROLE_KEY` is missing, so settings cannot be read, or `0004_seed.sql` was not applied. |
| Signup reports that instant access is unavailable | Turn off **Confirm email** in Supabase Auth, or configure `SUPABASE_SERVICE_ROLE_KEY` so the server can create confirmed accounts. |
| Login redirects back to `/login` | Site URL / redirect URLs in Supabase do not match the domain. Update them and clear cookies. |
| `/admin/*` redirects to the dashboard | The account's `profiles.role` is `user`. Promote it with the SQL in [First administrator](#6-first-administrator). |
| `/page/terms` returns 404 | `0004_seed.sql` has not run, or the page's `status` is `0` in **Admin → Content**. |
| Order fails with "Not enough funds" | Balance is lower than the charge. Add funds or approve a pending deposit. |
| Order fails with min/max errors | Quantity must be within the service's `min`/`max`. Check **Admin → Services** or `/services`. |
| Deposit approved but balance unchanged | Approvals are idempotent; if the request says `approved`, the credit already happened. Check `/transactions`. |
| API returns `Invalid API key` | Use the key on `/profile`; keys are per user. A blocked account returns 403. |
| API returns `Server is not configured` | `SUPABASE_SERVICE_ROLE_KEY` is not set in that environment. |
| Images or CSS return 404 | `public/` was not deployed. Confirm the build includes it and that `.vercelignore` only excludes `legacy`. |
| Vercel build fails | Check the root directory is the repository root, Node is 18.18+, and all required environment values are set for the right environment. |
| Production still uses an old URL | Update `SITE_URL` in your hosting environment and restart or redeploy. |

For anything not covered here, check the deployment logs first (Vercel → Deployments → Functions) and the Supabase logs second (Database and Auth). Server-side errors from Supabase usually name the table or policy involved.

---

Built for the Boost My Social panel. The original PHP application and its README remain in [`legacy/`](legacy) for historical reference.
