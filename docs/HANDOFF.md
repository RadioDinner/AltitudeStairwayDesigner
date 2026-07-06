# Handoff — as of 2026-07-06

Where the Altitude Stairway Designer stands, and what to pick up next. Everything
below is committed to `main`. Planning is complete; **implementation is well underway** —
the foundation (Supabase schema + placeholder catalog + generation engine) is done,
and the **Intake surface** (the two-number front door + a live procedural 3D render)
is built as a running Next.js app.

## State of play

**Planning is thorough; schema + catalog + engine + Intake UI are in place.** The repo holds strategy,
visual direction, domain language, and a v1 plan backed by 32 ADRs. Stack is settled
([ADR 0007](adr/0007-tech-stack.md)): React + Next.js (TypeScript), three.js via
react-three-fiber, Supabase, transactional email, deployed on Vercel.

**Built so far** — the v1 data model, materialized and verified:

- `supabase/migrations/20260706120000_init_catalog_schema.sql` — all 8 tables
  (company, material, gltf_asset, style, product, sku, design, purchase_order),
  4 enums, the circular default FKs (company→species, product→sku), the
  one-geometry-source CHECK on `sku`, and RLS enabled on every table (no anon
  policies — access is via server routes with the service-role key). Applied cleanly
  against PG16.
- `lib/catalog/` — zod validators for every JSONB shape (ADR 0014), plus enum
  mirrors. Firming shapes (`resolved`, `render`, `anchor_scale_spec`) are `looseObject`
  so they tolerate engine output not yet modeled.
- `supabase/seed/catalog.ts` + `supabase/seed.sql` — the curated placeholder catalog:
  one seeded Company, 5 materials (3 species incl. the default Red Oak, 2 metal
  finishes), 5 GLTF assets, 5 ornamental styles, 8 products (the full part set), and
  20 SKUs — a single `post_to_post` system, internally compatible by construction.
  `catalog.ts` is the source of truth: it validates every JSONB payload against
  `lib/catalog/` and cross-checks coherence at load; `npm run seed:build` regenerates
  `seed.sql` (do not hand-edit it). Migration + seed applied cleanly against PG16.
- `lib/engine/` — the generation engine (pure TS, no UI/IO): `(Intake + CatalogView)
  → resolved stair + SKU line-items + advisory warnings`. Honors the exact-float core
  with 1/16″ quantized edges (0022), ceil riser seed (0016), tread depth = Run +
  nosing (0031), per-tread balusters with the 2→3 bump (0023), and the advisory-only
  IRC ruleset (0015/0003). `generate()` reads the catalog via `toCatalogView`; a thin
  `configFromCatalog` pulls constants (nosing, max handrail stock, baluster section)
  from the catalog. **32 unit + integration tests pass** (`npm test`), including an
  end-to-end run against the seeded catalog.
- **Next.js app** (`app/`, `components/`) — the Intake surface, built with `/impeccable`
  to the "Joiner's Bench" system (DESIGN.md): OKLCH tokens + Geist Sans/Mono in
  `app/globals.css`, a two-number front door (`IntakeForm`) with feet-inches parsing
  (`lib/ui/feetInches.ts`, ADR 0022) and progressive disclosure for optional inputs,
  and a result view with a **live procedural 3D render** (react-three-fiber,
  `components/Scene3D` + `stairGeometry.ts`) + an instrument-readout panel with the
  ±1 riser stepper (ADR 0016) + advisory Code/Fit warnings. Wired to `generate()`
  against the static seed catalog (`components/catalog.ts`). Production build + 40
  tests green; **not yet visually QA'd in a browser** (no screenshot tool in that
  session) — eyeball `npm run dev` and tune camera/spacing.
- Project scaffolding: `package.json`, `tsconfig.json`, `.env.example` (secret split
  per ADR 0032), Supabase CLI config, vitest.

**Live Supabase project** — linked to `AltitudeStairDesigner` (ref
`ltgirvvewfywqbwqxvvs`, us-west-2); the init migration is **applied to the remote DB**
(`supabase migration list` shows local == remote at `20260706120000`). The **remote
is not seeded yet** — `seed.sql` runs on local `db reset`; the app currently reads the
static seed catalog (`components/catalog.ts`) client-side, so the DB isn't queried in
v1 yet. The catalog's `gltf_asset.storage_path`s point at `catalog/**` in Supabase
storage — the actual `.glb` files still need authoring + upload (ADR 0004; a modeling
task, tracked as an open thread).

Read these before doing anything (don't re-derive their decisions):

- **[PRODUCT.md](../PRODUCT.md)** — strategy: product register; users (homeowners +
  contractors); precise/trustworthy/calm personality; 4 anti-references; 5 design
  principles; WCAG 2.2 AA + strong reduced-motion.
- **[DESIGN.md](../DESIGN.md)** — visual system (**SEED**). North Star "The Joiner's
  Bench": restrained chrome, one warm timber accent, sans + tabular-mono for numbers,
  flat-by-default, responsive motion. Re-run `/impeccable document` in scan mode once
  code exists to extract real tokens + generate the live sidecar.
- **[CONTEXT.md](../CONTEXT.md)** — ubiquitous language. Use the terms exactly.
- **[PLAN.md](PLAN.md)** + **[adr/](adr)** — v1 plan and every settled decision.

## Decided this session (grill → ADRs 0019–0031)

- **0019** hard length limits are per-shop **catalog data**, not global constants
- **0020** draft autosave + Share Link from first edit; **one Design ↔ one PO**,
  read-only after submit
- **0021** curated **default per Product** seeds the first Design; species defaulted
- **0022** feet-inches input → **exact-float core** → quantized cut dims; uniformity
  check runs on the quantized parts
- **0023** **per-tread** balusters, derived count, bump 2→3 only for the raking 4″ check
- **0024** handrail **continuous** with a max warning; **splice policy** is a Product
  property
- **0025** the PO is an **RFQ** in v1; **required buyer contact** at submit
- **0026** active **warnings freeze onto the PO** + a submit **acknowledgment gate**
- **0027** minimal Intake: **Total Rise + Ceiling Height** required, rest optional
- **0028** v1 is **post-to-post**; `rail_system` named in schema
- **0029** optimistic **version guard** against silent clobber of a shared draft
- **0030** headroom assumes a **flush header** (documented, optimistic); header-drop
  input reserved
- **0031** tread **nosing is a catalog invariant**; tread depth = Run + nosing
- **0032** deploy on **Vercel, auto-deploying from git** (`main` → prod, PRs →
  preview URLs); secrets split client/server, previews use non-prod Supabase data,
  embed route needs explicit `frame-ancestors`/CSP headers

Also: **0016** corrected (`round`→`ceil` seed) and **0008** made explicit (post-to-post).

## Next steps

Per the plan's own "Immediate next step," build the foundation before surfaces:

1. ~~**Materialize the schema in Supabase**~~ — **done** (see "Built so far" above).
   Tables + JSONB columns + zod validators are in place and verified.
2. ~~**Author a placeholder catalog**~~ — **done**. `supabase/seed/catalog.ts` →
   `seed.sql`, validated + coherence-checked, applied cleanly against PG16. Still
   TODO within this step: author + upload the actual `.glb` assets the catalog's
   `storage_path`s point at (a modeling task — see Open threads).
3. ~~**Build the generation engine**~~ — **done**. `lib/engine/`, pure TS, 32 tests
   passing. `generate(view, intake)` → `{ stair, lineItems, warnings }`.

Then, in the build path:

4. **3D renderer** — _first cut done_ (procedural boxy parts from `ResolvedStair`;
   see `components/stairGeometry.ts`). Remaining: instanced **GLTF ornamental parts**
   (baluster/newel) once the `.glb` assets exist (step 2 TODO), material swaps per
   species, and an in-browser visual pass on lighting/camera/materials.
5. **Intake → live editor** — _first cut done_ (the front door + result view + ±1
   riser stepper). Remaining: the full **Configurator side panel** — per-part style /
   species / profile controls (reads each product's `selection_axes`), Primary Species
   cascade with per-part override (ADR 0011), thread selections through
   `generate()`/`resolveLineItems`, and **draft autosave + Share Link** persistence to
   a `design` row (ADR 0020/0029).
6. **PO/RFQ pipeline** (freeze snapshot + warnings, buyer contact, two emails) →
   iframe embed → user test.

Wiring notes for whoever picks up #4–6:
- The engine's `ResolvedStair`/`LineItem` shapes are what should firm up the
  `looseObject` validators (`design.resolved`, `purchase_order.line_items`) in
  `lib/catalog/jsonb.ts`.
- The editor persists a `design` row (autosave + version guard, ADR 0020/0029);
  `generate()` recomputes on each edit. Selections currently default to each
  product's default SKU (ADR 0021) — the editor adds per-part overrides, which
  `resolveLineItems`/`generate` will need threaded through (today it resolves the
  default SKU only; the seam is `CatalogView` + an optional selection map).
- Run-length handling is deliberately per the plan: Run is a derived default
  (`DEFAULTS.runInch = 11″`), and the available run is only a Fit check — revisit if
  user testing wants the stair to fit a given footprint instead.

## Open threads (not blocking)

- Implementation details only: GLTF/anchor-scale authoring pipeline, PDF + email
  deliverability, exact warning/acknowledgment copy.
- **Return nosing** on the open-side tread ends — parked as a profile detail (0031).
- DESIGN.md exact OKLCH values + font families + Components section — resolve on the
  first scan-mode `/impeccable document` run once there's code.
