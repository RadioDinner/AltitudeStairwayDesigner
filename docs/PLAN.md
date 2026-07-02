# Altitude Stairway Designer — v1 Plan

Synthesized from a grilling + domain-modeling session. Terminology lives in
[`/CONTEXT.md`](../CONTEXT.md); the decisions below each link to an ADR in
[`docs/adr/`](./adr).

## Vision

A white-label, embeddable 3D stair configurator that stair-parts **Companies**
license for their own websites. A site visitor enters a few facts about their
space, gets a live, code-compliant 3D staircase they can reshape, and finishes by
emailing a **Purchase Order** to the seller. Each Company is a tenant with its own
catalog, pricing, and branding ([ADR 0006](./adr/0006-multi-tenant-white-label-end-state-single-tenant-v1.md)).

## What v1 is for

v1 is a **single-tenant, anonymous test harness**. It must prove two things:

1. **Technical feasibility** — we can generate a code-compliant straight-run stair
   in interactive 3D from a few inputs, and it feels good to use.
2. **User desirability** — real homeowners/contractors enjoy configuring a stair
   this way and would use it.

Commercial pull (do Companies want to embed it?) is a **parallel sales motion**
using v1 as the demo. PO fulfillment-fidelity is **gated on catalog sourcing** and
is not a v1 goal.

## Scope

**In:**
- Straight-run stairs only ([ADR 0001](./adr/0001-finish-parts-only-scope.md))
- Closed risers only; open risers deferred ([ADR 0017](./adr/0017-closed-risers-only-v1.md))
- Single open side with a full guard, one wall side; sidedness fixed ([ADR 0018](./adr/0018-single-open-side-fixed-v1.md))
- Finish parts only; stringers/structure out entirely ([ADR 0001](./adr/0001-finish-parts-only-scope.md))
- Part set: treads, risers, balusters, handrail, newel posts + fillets, shoe rails,
  caps ([ADR 0008](./adr/0008-v1-part-set.md))
- Hybrid configurator: free structural dimensions + discrete catalog product picks,
  catalog is source of truth ([ADR 0002](./adr/0002-hybrid-configurator-catalog-source-of-truth.md))
- IRC-compliant generation with advisory overrides, one national ruleset
  ([ADR 0003](./adr/0003-irc-enforcement-with-advisory-overrides.md))
- Intake → live editor with side-panel controls + real-time 3D preview
- Persist Design on PO submit + no-login Share Link
- PO = price-free PDF, emailed to one configured seller address

**Out (deferred):**
- L/U/winder/curved geometries; structural parts; other accessories
- Pricing (future per-company Price Sheets — [ADR 0005](./adr/0005-no-pricing-in-v1-future-per-company-price-sheets.md))
- Multi-tenant onboarding, per-tenant branding, dealer logins
- Direct 3D drag-manipulation; per-jurisdiction code rules

## Architecture

- **Stack** ([ADR 0007](./adr/0007-tech-stack.md)): React + Next.js (TypeScript),
  three.js via react-three-fiber, Supabase (Postgres + auth + storage),
  transactional email for PO delivery.
- **Embeddability:** configurator ships as an iframe-embeddable route from day one.
- **Tenancy:** catalog, pricing, branding, and PO routing are **scoped by Company
  in the schema now**, even though v1 runs single-tenant. No global singletons
  ([ADR 0006](./adr/0006-multi-tenant-white-label-end-state-single-tenant-v1.md)).
- **3D assets** ([ADR 0004](./adr/0004-hybrid-3d-asset-strategy.md)): procedural
  geometry for boxy parts (treads/risers/rail/skirt); authored GLTF per ornamental
  style (baluster, newel), instanced along the stair.

### Catalog schema

Storage is **hybrid**: relational tables for stable/joined entities, validated
**JSONB** for variable-shape config, and snapshot rows for designs/POs
([ADR 0014](./adr/0014-hybrid-postgres-storage-relational-core-jsonb-config.md)).
Everything is **scoped by `company`** from day one ([ADR 0006](./adr/0006-multi-tenant-white-label-end-state-single-tenant-v1.md)).

**Relational tables**

- `company` — the tenant (one seeded test row in v1)
- `product` — a configurable family of one part type (tread | riser | baluster |
  handrail | newel | shoe_rail | fillet | cap). Declares option axes + dimension
  bindings; **products-with-axes** model ([ADR 0009](./adr/0009-catalog-products-with-axes-resolving-to-skus.md)).
  JSONB: `selection_axes`, `dimension_bindings`, `match_keys`, `rail_system`.
- `sku` — the orderable resolution of a product's axis values; references a
  geometry (`style` or procedural profile) + a `material`; fixed stock dimensions;
  **no price** ([ADR 0005](./adr/0005-no-pricing-in-v1-future-per-company-price-sheets.md)).
- `style` — ornamental geometry family; references a `gltf_asset`. JSONB:
  `anchor_scale_spec`. Boxy parts use a procedural `profile` id instead.
- `material` — a species/finish value → a PBR material/texture. Geometry-by-style,
  material-by-species are **orthogonal** ([ADR 0012](./adr/0012-orthogonal-geometry-by-style-material-by-species.md)).
- `gltf_asset` — pointer to the authored model in Supabase storage.

**JSONB shapes (validated app-side)**

- `selection_axes` — discrete user-facing dropdowns (species, profile, style);
  material values are per-product ([ADR 0011](./adr/0011-coordinated-primary-species-with-override.md)).
- `dimension_bindings` — each physical dimension → a geometry value or fixed value,
  plus a **stocking rule** (`fixed` | `stock_lengths` | `cut_to_size`)
  ([ADR 0010](./adr/0010-selection-axes-vs-dimension-bindings.md)).
- `anchor_scale_spec` — base/top anchors, scalable axis, fixed-detail zones.
- `match_keys` / `rail_system` — reserved compatibility fields, unenforced in v1
  ([ADR 0013](./adr/0013-defer-compatibility-engine-curate-compatible-catalog.md)).

**Snapshot rows**

- `design` — space inputs (Total Rise, run length, width) + Primary Species +
  chosen axis values + resolved dimensions + advisory-override flags; addressed by
  a Share-Link UUID.
- `purchase_order` — frozen resolved SKU line-items (SKU, quantity, cut dims),
  emailed; price-free in v1. Catalog edits never mutate a submitted PO.

### Resolution flow (Design → PO)

1. Configurator reads each product's `selection_axes` → renders side-panel controls;
   Primary Species cascades as the default material.
2. Engine computes `dimension_bindings` from the stair geometry.
3. Each (axis values + resolved dimensions) resolves to a concrete `sku` via the
   product→sku mapping; the `stocking_rule` yields quantity + cut list.
4. PO freezes those line-items as a snapshot.

## The generation engine (the hard core)

Given **Total Rise**, run length, width, **Ceiling Height**, and (optional)
**Stairwell Opening Length**:
1. Derive **Riser Count** = round(Total Rise ÷ 7¾″), then **Rise** = Total Rise ÷
   Riser Count (uniform by construction). Rise is read-only; the user adjusts Riser
   Count via a ±1 stepper ([ADR 0016](./adr/0016-derived-rise-adjust-riser-count.md)).
2. Derive **Run** (≥ 10″), tread count = risers − 1, total run length; raise a
   **Fit warning** (advisory, no clamp) if it exceeds available run length. Real
   technical hard limits are a reserved, unenforced seam
   ([ADR 0019](./adr/0019-advisory-fit-warnings-reserve-hard-limits.md)).
3. Auto-derive **baluster** count/spacing from the IRC 4″-sphere rule.
4. Compute **handrail** and **shoe rail** length, **fillet** quantity, **newel**
   positions (2), **cap** count (2).
5. Re-run checks live on every edit; surface **Advisory Overrides** as warnings,
   never hard-blocks ([ADR 0003](./adr/0003-irc-enforcement-with-advisory-overrides.md)).

### v1 IRC ruleset ([ADR 0015](./adr/0015-v1-irc-dimensional-ruleset.md))

All checks are advisory (flagged, never blocking): max Rise 7¾″; min Run 10″;
rise & run uniformity ≤ ⅜″; min headroom 6′8″; min width 36″; handrail height
34″–38″; baluster 4″-sphere spacing. Handrail graspability is out (a catalog Style
property, not generated geometry). Headroom is measured at the stairwell opening's
near edge: `headroom = ceiling_height − Total Rise + slope × opening_length`, which
is why Intake collects **Ceiling Height** (required) and **Stairwell Opening
Length** (optional, defaulting to full projected run).

## Top risks

1. **Catalog sourcing** (critical path — [ADR 0002](./adr/0002-hybrid-configurator-catalog-source-of-truth.md)):
   no real seller catalog yet. Build against a **placeholder catalog** matching the
   schema; swap in real SKUs later. Without it the PO is illustrative only.
2. **Ornamental asset pipeline** ([ADR 0004](./adr/0004-hybrid-3d-asset-strategy.md)):
   each baluster/newel style is a modeling task. Mitigated by a deliberately small
   v1 catalog.
3. **IRC rule correctness:** getting rise/run/headroom/spacing right is the
   credibility of the whole tool. Needs a real-stair sanity check.

## Suggested build path

1. **Placeholder catalog + schema** in Supabase (tenant-scoped), a handful of SKUs
   per part type, 3–5 baluster + 2–3 newel GLTF assets.
2. **Generation engine** (pure TS, unit-tested against IRC): inputs → derived stair
   + compliance flags. No UI.
3. **3D renderer**: procedural boxy parts + instanced GLTF ornamental parts from the
   engine's output.
4. **Intake → live editor** with side-panel controls wired to the engine, real-time
   preview, advisory warnings.
5. **PO pipeline**: server-side PDF + email + persist Design + Share Link.
6. **Iframe-embeddable packaging** of the configurator route.
7. **User test** with a handful of target users; capture completion + desirability.

## Immediate next step

The catalog/SKU schema is now resolved (see **Catalog schema** above,
[ADR 0009–0014](./adr)). The next concrete moves:

1. **Materialize the schema in Supabase** — the relational tables + JSONB columns,
   with app-side validators (zod) for the JSONB shapes.
2. **Author a placeholder catalog** — one seeded company, a curated fully-compatible
   set (one rail system), a handful of SKUs per part type, and 3–5 baluster + 2–3
   newel GLTF assets.
3. **Build the generation engine** (pure TS, unit-tested against IRC) against that
   schema — inputs → resolved stair + SKU line-items + compliance flags, no UI.

Then proceed down the build path (3D renderer → editor → PO pipeline → embed → user
test).
