# Boost My Social — Next.js + Supabase

A complete rebuild of the Boost My Social SMM panel on **Next.js 15 (App Router)** and **Supabase (Postgres + Auth)**. The public site, dashboard, order flow, support tickets, services catalogue, admin panel and panel API all work the same way as the original PHP application, with the same markup, classes and colour scheme from the `regular` theme.

The original PHP application is preserved in [`legacy/`](legacy) for reference and is excluded from Vercel deployments.

---

## Contents

- [What's included](#whats-included)
- [Project structure](#project-structure)
- [1. Create the Supabase project](#1-create-the-supabase-project)
- [2. Run the migrations](#2-run-the-migrations)
- [3. Configure environment variables](#3-configure-environment-variables)
- [4. Run locally](#4-run-locally)
- [5. Deploy to Vercel](#5-deploy-to-vercel)
- [First administrator](#first-administrator)
- [Importing your old data](#importing-your-old-data)
- [Panel API](#panel-api)
- [How money movements work](#how-money-movements-work)
- [Feature parity notes](#feature-parity-notes)
- [Troubleshooting](#troubleshooting)

---

## What's included

| Area | Routes |
|---|---|
| Marketing site | `/`, `/faq`, `/page/[slug]`, `/news` |
| Authentication | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback` |
| Dashboard | `/dashboard`, `/order/add`, `/order/log`, `/dripfeed`, `/subscriptions` |
| Account | `/services`, `/add-funds`, `/transactions`, `/tickets`, `/tickets/new`, `/tickets/[id]`, `/api/docs`, `/profile` |
| Admin | `/admin/orders`, `/admin/users`, `/admin/deposits`, `/admin/subscribers`, `/admin/services`, `/admin/categories`, `/admin/providers`, `/admin/content`, `/admin/tickets`, `/admin/settings` |
| API | `POST /api/v1` (actions: `services`, `add`, `status`, `balance`) |

Everything is server-rendered with React Server Components and protected with Supabase Row Level Security. Balance changes happen only inside Postgres functions, so two simultaneous orders can never overdraw an account.

## Project structure

```
src/app                 Next.js App Router pages, layouts and server actions
  (site)                public marketing pages + shared landing layout
  (auth)                login / signup / password pages
  (dash)                dashboard and admin area
  api/v1                panel API route
  actions               server actions (auth, dashboard, admin)
src/components          shared UI (dashboard shell, status badges, forms…)
src/lib                 Supabase clients, auth helpers, settings, formatting, i18n
supabase/migrations     SQL migrations (schema, functions, RLS, seed data, API)
public/assets           original CSS, JS, fonts, images and plugins
public/themes/regular   original theme stylesheet and images
legacy                  the original PHP application (not deployed)
scripts                 optional data-migration helpers
```

---

## 1. Create the Supabase project

1. Go to [database.new](https://database.new) and create a project.
2. Open **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (server only)

## 2. Run the migrations

The SQL lives in `supabase/migrations` and is numbered so it can be applied in order:

| File | Purpose |
|---|---|
| `0001_schema.sql` | Tables: profiles, settings, categories, services, orders, transactions, deposits, tickets, content |
| `0002_functions.sql` | First-admin trigger, `place_order`, `request_deposit`, `admin_approve_deposit`, `admin_update_order`, `admin_adjust_balance` |
| `0003_rls.sql` | Row Level Security policies + order cancellation request |
| `0004_seed.sql` | Your real categories (91), services (98) and site settings from the old MySQL dump, starter FAQs and pages |
| `0005_api.sql` | API order function + API-key rotation |

**Option A — Supabase CLI**

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Option B — SQL editor**

Open **SQL Editor** in the Supabase dashboard and run each file in order (`0001` → `0005`).

> Payment provider keys from the old install were deliberately **not** copied into the repository. Add them in the database (`payment_methods.config`) or keep using the manual deposit flow, which is enabled by default.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (server-only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your production URL on Vercel |

Also open **Authentication → URL Configuration** in Supabase and add:

- Site URL: your production URL (e.g. `https://boostmysocial.vercel.app`)
- Redirect URLs: `https://your-domain/auth/callback`, `http://localhost:3000/auth/callback`

## 4. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Sign up once — that account becomes the administrator.

## 5. Deploy to Vercel

1. Push this repository to GitHub (already on the `arena/aa46e54b-boostmysocial` branch).
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework is detected as **Next.js**. Leave the build settings as they are.
4. Add the four environment variables from step 3 for **Production** (and Preview if you want).
5. Deploy.

Notes:

- `legacy/` is listed in `.vercelignore`, so the PHP app is never uploaded.
- The static assets in `public/` are served directly by the CDN.
- If you use a custom domain, update `NEXT_PUBLIC_SITE_URL` and the Supabase redirect URLs to match.

## First administrator

The first account created after the migrations becomes `admin` automatically (a trigger on `auth.users`). Every later signup is a normal user.

To promote someone else:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Importing your old data

The migrations already import the catalogue and settings from `legacy/dlititci_boostmysocial2.sql`:

- 91 categories
- 98 services with prices, minimums and maximums
- site title, description, currency, social links, feature switches
- starter FAQs and terms/cookie pages

**Users, orders and tickets are not copied automatically.** Orders/tickets are empty in the dump, so there is nothing to migrate there.

Existing users can be imported with their current passwords, because Supabase Auth verifies bcrypt hashes and the old panel stored bcrypt hashes:

```bash
node scripts/import-legacy-users.mjs      # writes scripts/output/legacy-users.sql
```

Run the generated file in the Supabase SQL editor, verify you can sign in, then delete it (it contains password hashes and is git-ignored).

## Panel API

Endpoint: `POST https://your-domain/api/v1`

```bash
# List services
curl -X POST https://your-domain/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=services"

# Place an order
curl -X POST https://your-domain/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=add" \
  -d "service=1" -d "link=https://instagram.com/p/xxxx" -d "quantity=1000"

# Order status (single or multiple)
curl -X POST https://your-domain/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=status" -d "order=100"

# Balance
curl -X POST https://your-domain/api/v1 \
  -d "key=YOUR_API_KEY" -d "action=balance"
```

The key is shown on **Profile** and **API** pages. JSON bodies are accepted too.

## How money movements work

- `place_order(service_id, link, quantity)` — verifies the service is active, checks min/max, applies the user's custom rate when one exists, locks the profile row, deducts the charge, writes the order and a ledger entry. Raises `insufficient_funds` when the balance is too low.
- `request_deposit(method_id, amount, reference)` — creates a pending deposit and computes any configured bonus.
- `admin_approve_deposit(request_id, approve)` — credits the balance exactly once (idempotent, admin-only).
- `admin_update_order(order_id, status, start_count, remains)` — refunds the full charge on cancel/refund and the undelivered share on partial orders.
- `admin_adjust_balance(user_id, amount, note)` — manual credit/debit with a ledger entry.

All of these are `SECURITY DEFINER` functions with `EXECUTE` restricted to signed-in users, and admin-only checks inside the function body.

## Feature parity notes

Everything below behaves like the PHP panel:

- Landing page sections, header/footer, service symbol legend, FAQ accordion, newsletter form
- Email/password signup and login, password reset, blocked accounts
- Statistics dashboard, order placement (single), order logs with filters/pagination and cancel requests
- Services catalogue with per-user pricing, add-funds, transaction ledger
- Support tickets with replies
- Admin: orders (status/start count/remains with automatic refunds), users (role, status, balance), deposits approval, services, categories, providers, settings, content, tickets, subscribers
- Panel API (`services`, `add`, `status`, `balance`)

Differences caused by moving off PHP/cron hosting:

- **Payment gateways**: the old install embedded Paystack/PayPal/Stripe SDKs with live keys. This build ships a **manual deposit workflow** (request → admin approval) plus the `payment_methods` table for wiring a gateway later. No secret keys are committed.
- **Provider order forwarding**: the PHP version relied on cron workers to push orders to upstream providers. Here orders are stored with status `pending` and managed from **Admin → All orders** (or updated by your own worker calling the database). The provider records are kept for reference/import.
- **Mass orders, dripfeed creation, subscriptions creation, file manager, multi-language editor, module marketplace** from the PHP panel are not re-implemented; their database fields and listing screens exist. Ask if you want any of them added.
- Only the `regular` theme is ported (it is the active theme in the old install). The `monoka` and `pergo` themes remain in `legacy/`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Pages render with default logo/title | Settings table not seeded or service role key missing — run `0004_seed.sql`, check `SUPABASE_SERVICE_ROLE_KEY`. |
| "Supabase is not configured" banner | `.env.local` missing or variables not restarted. |
| Signup email never arrives | Supabase → Authentication → Email; use a custom SMTP for production, or disable "Confirm email" while testing. |
| Login redirects back to /login | Check `NEXT_PUBLIC_SITE_URL` and the redirect URLs in Supabase Auth settings. |
| `/admin/*` redirects to dashboard | Your profile role is `user`. Promote it with the SQL above. |
| Vercel build fails on `legacy/` | It should be ignored; ensure `.vercelignore` is committed. |

---

The original PHP README and installation notes remain in `legacy/`.
