# v1 tech stack

- **Frontend / app framework:** React + Next.js (TypeScript). One codebase for the
  landing site, the configurator app, and serverless API endpoints.
- **3D:** three.js via react-three-fiber — procedural geometry for boxy parts and
  GLTF assets for ornamental parts (ADR 0004).
- **Data / backend:** Supabase (Postgres + auth + storage). Catalog, pricing, and
  branding are scoped by Company from day one (ADR 0006); storage holds GLTF assets
  and generated PO PDFs. Anonymous v1 may need no user tables yet.
- **Embedding:** the configurator ships as an iframe-embeddable route from the
  start, for clean per-tenant isolation on host sites (ADR 0006).
- **PO pipeline:** PDF generated server-side and sent via a transactional email
  service (e.g. Resend/SendGrid/SES) — no self-hosted mail server.
- **Deploy:** Vercel, auto-deploying from git — `main` → production, PRs → preview
  URLs (ADR 0032).

Why: this is the conventional, well-supported path for browser 3D + white-label
widgets, keeps everything in one TypeScript codebase, and Supabase covers
database, auth, and asset/PDF storage without standing up separate services.
