# Deploy on Vercel, auto-deploying from git

The app is Next.js ([ADR 0007](0007-tech-stack.md)) with Supabase as the managed
data/backend, so hosting only needs to serve the Next.js frontend + serverless API
routes — the database, auth, and asset/PDF storage live in Supabase, not on the app
host. We deploy on **Vercel**, wired to the git repo so that **every push to `main`
ships to production and every branch/PR gets its own preview deploy** — no manual
build-and-upload step.

## Why Vercel, and why auto-deploy

- Vercel is the first-party host for Next.js: server components, serverless/edge API
  routes, image optimization, and framework defaults work with zero config, which is
  the same "conventional, well-supported path" reasoning that settled the stack in
  ADR 0007.
- **Git-triggered auto-deploy** keeps a solo/small team shipping without a release
  ritual: merge to `main` → production; open a PR → a shareable **preview URL** that
  runs the real build against the same code. Preview deploys pair naturally with the
  draft **Share Link** and desirability-test workflow — you can put a live build in
  front of a tester per branch.
- Supabase carries the stateful lock-in ([ADR 0014](0014-hybrid-postgres-storage-relational-core-jsonb-config.md));
  the app host is comparatively **swappable**, so committing to Vercel is a low-cost,
  easy-to-reverse choice — the opposite of a database decision.

## Considered and rejected

- **Self-hosting (container on a VM / a Node host)** — more ops surface (build
  pipeline, TLS, scaling, preview environments) than a pre-revenue v1 warrants, for
  no benefit while the framework is Next.js.
- **Netlify / Cloudflare Pages** — comparable DX, but neither tracks Next.js features
  as closely as its first-party host; no reason to trade that away.

## Consequences

- **Secrets live in Vercel env vars**, per environment. The Supabase URL + anon key
  are public-safe client config; the **service-role key and email-service key
  ([ADR 0025](0025-po-is-an-rfq-required-buyer-contact.md)) are server-only** and must
  never be exposed to the client bundle or the iframe embed.
- **Preview deploys are public-by-URL** and run real server code. They must point at a
  **non-production Supabase project (or isolated data)** so a shared preview link can't
  read or mutate real Designs/POs.
- The **iframe-embed route** ([ADR 0006](0006-multi-tenant-white-label-end-state-single-tenant-v1.md))
  needs its framing/CSP headers (`Content-Security-Policy: frame-ancestors …`,
  `X-Frame-Options`) set in Next.js/Vercel config so host sites can embed it — the
  default deny-framing posture would otherwise break the embed.
- If a future tenant/compliance requirement rules out Vercel, the escape hatch is any
  Next.js-capable host; only the deploy wiring and env config move, not app code.
