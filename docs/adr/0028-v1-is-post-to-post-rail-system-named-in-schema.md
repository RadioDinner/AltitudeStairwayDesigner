# v1 is post-to-post; rail_system carries a real value in the schema

v1 ships exactly one rail system, and that system is **post-to-post (P2P)**: the
handrail runs as a straight segment that **dies into the sides of full-height,
cap-topped newels**, with no curved over-the-post fittings.

## Making the implicit choice explicit

The part set already chose this silently. ADR 0008 includes **caps (one per newel)**
and explicitly **defers "rail fittings/brackets."** Caps + no fittings *is* P2P —
over-the-post requires the exact fittings (volutes, turnouts, goosenecks, up-easings)
0008 deferred, and OTP pin-top newels take no cap at all. This ADR records the choice
rather than introducing it.

It is also coherent with what the generation engine already assumes: ADR 0024's
"handrail is one continuous piece terminating into newels" *is* the P2P straight-run
rail. Choosing OTP would reopen both ADR 0008 (part set) and ADR 0024 (the rail
becomes rail-plus-fittings, not a single stick).

Why P2P over OTP for v1:

- **Geometry lift** — a single straight flight is one straight rail between two end
  newels, zero curved fittings to author. OTP means swept curved geometry with hard
  anchor/scale specs, fighting the small-catalog / small-asset-pipeline mitigation
  ([ADR 0004](0004-hybrid-3d-asset-strategy.md)) the risk list depends on.
- **Sourcing** — P2P and OTP SKUs are largely non-interchangeable; naming the system
  tells us which real seller catalogs are sourceable ([ADR 0013](0013-defer-compatibility-engine-curate-compatible-catalog.md)).

## Named in the schema now

`rail_system` — already a reserved compatibility field on products/SKUs
([ADR 0013](0013-defer-compatibility-engine-curate-compatible-catalog.md)) — carries
a concrete value (`post_to_post`) from day one, not a placeholder. Every seeded SKU
declares it, so the curated v1 catalog is internally compatible by construction (a
single system → all parts mutually compatible). Over-the-post can be added later as a
**second `rail_system` value** without a schema migration; the field was built to
hold more than one.

## Deferred

Over-the-post as a second rail system — its fittings sub-catalog and curved-asset
authoring are a distinct later effort.
