# Handoff — as of 2026-07-03

Where the Altitude Stairway Designer stands, and what to pick up next. Everything
below is committed to `main`; there is no code yet — this is a fully-specced,
pre-implementation project.

## State of play

**Planning is thorough; implementation has not started.** The repo holds strategy,
visual direction, domain language, and a v1 plan backed by 32 ADRs. Stack is settled
([ADR 0007](adr/0007-tech-stack.md)): React + Next.js (TypeScript), three.js via
react-three-fiber, Supabase, transactional email, deployed on Vercel.

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

1. **Materialize the schema in Supabase** — relational tables + JSONB columns, with
   zod validators for the JSONB shapes (company w/ default species + version column;
   product w/ default selection, splice_policy, rail_system; sku; style; material;
   gltf_asset; design; purchase_order w/ buyer contact + frozen warnings).
2. **Author a placeholder catalog** — one seeded company, a curated post-to-post set,
   a handful of SKUs per part type, 3–5 baluster + 2–3 newel GLTF assets.
3. **Build the generation engine** (pure TS, unit-tested against IRC) — inputs →
   resolved stair + SKU line-items + compliance flags, no UI. Honor the units model
   (ADR 0022), ceil seed (0016), per-tread balusters (0023), tread depth = Run +
   nosing (0031).

Then: 3D renderer → **Intake** editor (`/impeccable craft intake` — the two-number
front door is the smallest honest first surface) → PO/RFQ pipeline → iframe embed →
user test.

## Open threads (not blocking)

- Implementation details only: GLTF/anchor-scale authoring pipeline, PDF + email
  deliverability, exact warning/acknowledgment copy.
- **Return nosing** on the open-side tread ends — parked as a profile detail (0031).
- DESIGN.md exact OKLCH values + font families + Components section — resolve on the
  first scan-mode `/impeccable document` run once there's code.
