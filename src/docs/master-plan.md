# Master Plan: Sleeper-Fantasy Assistant SaaS

## Goals

- Deliver a paid assistant that improves lineup/waivers/trades using Sleeper data plus safe context (bye weeks, weather, headlines).
- Ship both chat and proactive UX (dashboard, alerts) with explainability and low ToS/IP risk.

## Scope (Phase 0–2)

- Phase 0: Platformize existing MCP tools; add HTTP transport; production caching/limits; basic UI.
- Phase 1: Lineup validator, waivers/FAAB helper, alerts, context pack (bye/schedule/weather/news).
- Phase 2: Trade analyzer, scenario planner, multi-league, billing, observability.

## Architecture

- Presentation: Next.js app (UI, SSR/ISR, thin BFF) on Vercel.
- Tooling: MCP server over HTTP via Vercel Functions using `mcp-handler`.
- Backend services: Redis (hot cache/rate limit/queues), Postgres (users/leagues/indexes), Object storage (players snapshots), optional worker for heavy jobs.
- Data ingestion: Sleeper API (read-only) + public-domain/licensed context (NWS/Open‑Meteo RSS headlines only).
- Security: OAuth for MCP endpoint, JWT sessions for web, per-tenant quotas; no logos/marks.

## Repo Structure (Monorepo)

Monorepo with a root `package.json` (workspaces) and a `package.json` per app/package. Vercel project Root Directory = `apps/web`. Internal deps use `workspace:*` and builds run only for `apps/web`.

- `apps/web` (Next.js UI + API + `/api/mcp` via `mcp-handler`; HTTPS MCP on Vercel).
- SDKs: Vercel AI SDK (streaming/chat), `mcp-handler` (HTTP MCP), TanStack Query (data), zod (validation)
- Auth & limits: NextAuth.js or Clerk; Upstash Ratelimit
- UX & DX: Tailwind (styling) or Chakra; react-hook-form (forms)
- Observability: Sentry (errors/perf), OpenTelemetry (traces)
- Payments: Stripe SDK (billing/webhooks)
- MCP handler wiring: import tool registry from `packages/mcp-tools`, register with `createMcpHandler`, wrap with `withMcpAuth` (OAuth scopes), stream responses, enforce per-tenant limits; map errors/timeouts consistently

- `apps/worker` (optional; cron/queues for refresh/alerts if Vercel Cron isn’t enough).
- `packages/mcp-tools` (tool schemas/handlers; transport‑agnostic; shared by HTTP/stdio).
- `packages/core` (Sleeper client, caching, enrichment; HTTP client, rate limiter).
- `packages/shared` (types, zod, logger, config shared across apps).
- `infra/` (IaC, CI/CD, runbooks).

Build/install: pnpm/yarn workspaces; Vercel installs from repo root and builds `apps/web`. Turborepo/Nx optional for task graph and remote caching.

Migration notes from current repo:

- Move `src/tools/*` → `packages/mcp-tools`.
- Move `src/api-service.ts`, `src/cache*.ts`, `src/utils/response-helpers.ts`, `src/types.ts` → `packages/core`.
- Add `apps/web/app/api/mcp/route.ts` (HTTP MCP). Keep optional stdio bin for local dev.

## Hosting & Services

- Vercel: Host UI, HTTP MCP and BFF; add Vercel Cron for light schedules.
- Reference: Vercel “Deploy MCP servers to Vercel.” ([link](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel))
- Redis (Upstash): Hot cache, request collapsing, rate limits, queues.
- Postgres (Neon/Supabase): Users, league links, audit logs, player search index.
- Object storage (R2/S3/Vercel Blob): `players-{sport}-{season}.json` snapshots (versioned) + CDN.
- Optional worker host (only if needed): Cloud Run/Fly/Render for long jobs/queues.
- Email/Chat notifications: Postmark/Resend + Discord/Slack webhooks.
- Payments: Stripe.
- Observability: Sentry + OpenTelemetry + Vercel Observability.

## Data & Compliance

- Sleeper: Only documented read-only endpoints; user-scoped; aggressive caching; no bulk redistribution.
- Weather: NWS (public domain) or Open‑Meteo (permissive). Store only needed fields.
- News: RSS headlines/links (no full text). Attribute source.
- Bye weeks/stadiums: Curated JSON with attribution. No team logos/marks.

## Caching, Limits, Resilience

- Replace TTL-only cache with Redis-backed request coalescing, token bucket per tenant, and LRU by key.
- Player blob: store in object storage with ETag; Redis hot cache; daily refresh (shorter windows on game days).
- HTTP client: timeouts, retries with exponential backoff + jitter; circuit breaker.

## Security & Auth

- MCP: OAuth (with `withMcpAuth`) and `.well-known/oauth-protected-resource` route; scopes per tool group.
- Web: NextAuth/Clerk/Auth0; signed JWTs; RBAC for admin.
- Secrets: Vercel env vars; rotate; least-privilege.

## Observability & Ops

- Structured logs, request IDs, tracing across web→MCP→Sleeper.
- SLOs: p95 latency per tool; cache hit rate; error budget alarms.
- Runbooks: rate limit breach, upstream outage, cache purge.

## Phased Roadmap

- Phase 0 (Foundation)
1) HTTP MCP on Vercel; reuse `mcp-tools` and `core`.
2) Redis limits/cache; object storage for player snapshots; Postgres baseline.
3) Next.js UI shell + auth; basic dashboard; MCP OAuth.
- Phase 1 (Core UX)
4) Lineup validator (byes/injuries/weather) with explanations.
5) Waivers/FAAB using Sleeper trending + roster fit.
6) Alerts (injury status changes, inactives, weather severity). Vercel Cron → queue.
7) Context pack (bye weeks JSON, schedule, stadiums, NWS/Open‑Meteo).
- Phase 2 (Upsell)
8) Trade analyzer & scenario planner.
9) Multi-league support; user projections CSV upload.
10) Billing (Stripe), quotas, feature flags; expanded observability.

## Risks & Mitigations

- ToS/licensing: Confirm Sleeper use; avoid ESPN/Yahoo; use public-domain/licensed context.
- Rate limits: Redis limits, request collapsing, background refresh.
- Cold starts/latency: Keep hot cache; stream responses; prewarm during peak.
- Data staleness: Time-aware TTLs (game day vs off days) + ETag validation.

## Success Metrics

- Activation: % users connecting leagues and running first validator.
- Accuracy: Disagreement rate with user after explanation; alert precision.
- Reliability: Cache hit rate, upstream failure rate, p95 latency.
- Revenue: Free→Pro conversion, churn.
