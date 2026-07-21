# BTCSCAM.COM

**Community-verified crypto-scam intelligence.** A newsroom + community platform to expose scams, verify reports, and protect the community.

> ⚠️ This is a scam-**awareness** project — journalism and defense. It is not, and must never be presented as, a scam. Footer everywhere: *Not financial advice · Verify everything.*

## Features

- **Newsroom** — investigations, alerts, scam database, magazine, ScamCast, The Rug Report newsletter
- **Community forum** — reddit-style threads, nested comments, voting
- **Report-a-Scam portal** — public intake → staff triage → linked database entries
- **Scam Database** — community-verified entries with a live Threat Board
- **Store** — merch with a cart, crypto-only checkout, and order tracking
- **Donations & film fundraiser** — crypto-only (on-chain address + QR)
- **Consultation desk** — victim support / recovery guidance intake
- **Staff area** — Editor Desk, Manager Console, and an Admin Panel with full **RBAC**:
  roles (member → contributor → copywriter → editor → manager → admin), plus per-user
  privilege **grant/revoke** on top of role defaults, ban/deactivate, and an audit log.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 6 · PostgreSQL ·
custom JWT auth (`jose` + `bcryptjs`). Design: print-broadsheet — Anton / Archivo / IBM Plex Mono.

## Local development

```bash
pnpm install

# Postgres (Docker) — or point DATABASE_URL at any Postgres
docker run -d --name btcscam-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=btcscam -p 5432:5432 postgres:16

cp .env.example .env      # then set AUTH_SECRET (openssl rand -base64 32)
pnpm db:push              # create tables
pnpm db:seed              # load sample content + dev accounts
pnpm dev                  # http://localhost:3000
```

### Dev accounts (password `watchtower`)

| Email | Role |
|---|---|
| `admin@btcscam.com` | Administrator |
| `mokafor@btcscam.com` | Editor |
| `jmanager@btcscam.com` | Manager |
| `dpatel@btcscam.com` | Copywriter |
| `chainwatcher@btcscam.com` | Member |

## Payments — crypto only

There is **no card processor**. Donations and store checkout display on-chain
addresses (BTC/ETH/USDT/USDC/XMR/XRP/TRX/CRYPT/OSM) with QR + copy, and record the
intent as *pending* until confirmed.

**The seeded wallet addresses are placeholders** (`PLACEHOLDER-…`). Replace them in
**Admin → Settings → Wallets** (or the `CryptoWallet` table) with real addresses
before accepting funds. Nothing can be misdirected while they remain placeholders.

## Deploy (Vercel)

1. Provision Postgres (Vercel Postgres / Neon) and set `DATABASE_URL` + `AUTH_SECRET` env vars.
2. Build command: `prisma generate && next build` (postinstall also runs `prisma generate`).
3. After first deploy, run `prisma db push` and `pnpm db:seed` against the prod database.
4. Add the `btcscam.com` domain in the Vercel project and point DNS at Vercel.
