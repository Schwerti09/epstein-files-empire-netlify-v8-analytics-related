# Epstein Files Empire (Netlify + Neon + Functions) — v4

✅ Newsroom layout (original)  
✅ RSS ingest + images (from RSS media/enclosure when available)  
✅ Optional AI enrichment (OpenAI Responses API)  
✅ Stripe paywall (Day Pass default, switch to Subscription)  
✅ Names index (entities)

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `site`
- Functions: `netlify/functions` (auto via netlify.toml)

## Neon
Run: `database/schema.sql` in Neon SQL Editor once.

## Required env vars
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `ADMIN_TOKEN` (long random string)

## Optional env vars
- `OPENAI_API_KEY` (for /api/enrich)
- `OPENAI_MODEL` (default: gpt-4o-mini)
- `CRON_SECRET` (for safe scheduled ingest)
- `CHECKOUT_MODE` = `payment` (default) or `subscription`
- `STRIPE_PRICE_ID` (required for subscription mode)

## First run
1) Deploy
2) Open `/admin.html`
3) Paste ADMIN_TOKEN
4) Add RSS sources
5) Click **Ingest**
6) Optional: **Enrich latest 5**


## Programmatic SEO
- Entity landing pages: `/file/:slug` (SSR via Netlify Function)
- Article pages: `/a/:slug` (SSR via Netlify Function)
- Dynamic OG images: `/.netlify/functions/og?name=...`
- Sitemap: `/sitemap.xml` (paged via `?page=1` etc; 2k entity URLs per page)


## Environment

### Required ENV variables (Netlify Site Settings → Environment variables)
- `DATABASE_URL` (Neon pooled connection string, sslmode=require)
- `ADMIN_TOKEN` (protects Admin endpoints)
- `STRIPE_SECRET_KEY` (Stripe secret key)

### Optional / recommended
- `STRIPE_PRICE_ID` (only if you run subscription mode)
- `CHECKOUT_MODE` (`payment` or `subscription`)
- `OPENAI_API_KEY` + `OPENAI_MODEL` (for auto entity extraction + AI-enrich)
- `CRON_SECRET` (protect scheduled ingest endpoint)

### Never commit secrets
Commit **`.env.example`** only. Keep real `.env` in `.gitignore`.

### Avoid retyping env on every deploy
Netlify stores env variables per site. You set them once and you're done.

If you prefer CLI automation:
```bash
npm i -g netlify-cli
netlify login
# Import a local .env file into the Netlify site (creates/updates vars)
netlify env:import .env
# Export existing env vars
netlify env:export
```


## Image caching (Edge)
- Function: `/.netlify/functions/img?url=<remote>&w=1200&h=675`
- Used automatically on the homepage + article SSR page.
- Caches at the edge via `Cache-Control: s-maxage=604800` (7 days) + SWR.
- Optional resizing via public resizer: set `IMG_RESIZE_MODE=weserv` (ENV) to enable resize+compression.


## Analytics-lite (Most Read)
- The article SSR endpoint writes `analytics_events` rows for human GET requests.
- Endpoint: `/api/most-read?days=7&limit=8`
- Related: `/api/related?slug=<slug>&limit=6`
