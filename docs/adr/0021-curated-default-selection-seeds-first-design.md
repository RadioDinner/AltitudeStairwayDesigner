# A curated default per Product seeds the first Design; species is defaulted, not asked

Intake collects only **spatial** inputs (Total Rise, run length, width, Ceiling
Height, optional Stairwell Opening Length). It asks **no** product, style, or
species questions. Yet the Configurator must open on a fully rendered, code-compliant
*and* sensibly-styled Design. So the initial part choices come from **curated
defaults in the catalog**, not from the user and not from insert order.

## The default marker

Each `product` carries a **default selection**: a default SKU plus default values
for its Option Axes (style, profile, species). The engine seeds the first Design by
taking each product's default, then computing dimensions from the derived geometry.

Because the catalog is scoped by Company ([ADR 0006](0006-multi-tenant-white-label-end-state-single-tenant-v1.md)),
defaults are **per-Company for free** — a tenant can lead with its hero SKUs. This
is a small, honest addition to data already being modeled, not a new entity.

Rejected: **first-in-catalog** (default becomes an accident of insert order,
uncurated, poor first impression) and a **whole pre-authored "starter Design" per
Company** (more authoring machinery than a single-tenant v1 needs).

## Primary Species is defaulted, with override

[Primary Species](../../CONTEXT.md) is **not** an Intake question. The Design opens
on a **default Primary Species** (a Company-level setting, company-scoped like the
rest of the catalog), which cascades as each wood part's default material
([ADR 0011](0011-coordinated-primary-species-with-override.md)). The user changes it
later in the side panel. Keeping species out of Intake keeps the first step short
and spatial; the styled result is immediately visible and editable.

## Consequences

- The schema materialized next gains a small **default marker** per product (default
  SKU + default axis values) and a **default Primary Species** per company. Cheap now,
  rework if omitted.
- "Code-compliant Design" now also means "sensibly-styled Design" from frame one —
  the 3D preview is never empty or random.
