# Hybrid Postgres storage: relational core + validated JSONB for variable config

Catalog storage in Supabase/Postgres is hybrid:

- **Relational tables** for stable, joined, integrity-enforced entities: `company`,
  `product`, `sku`, `style`, `material`, `gltf_asset`. Foreign keys enforce
  SKU ↔ product ↔ company ↔ asset.
- **JSONB columns** for heterogeneous, read-whole configuration whose shape varies
  per part type: `selection_axes`, `dimension_bindings` (with stocking rules),
  `anchor_scale_spec`, `match_keys`. Shape is validated in the app layer
  (TypeScript + a validator such as zod), since Postgres does not enforce JSONB
  structure.
- **Snapshot rows** for `design` (chosen axis values + resolved dimensions +
  advisory-override flags) and `purchase_order` (frozen resolved SKU line-items),
  so later catalog edits never mutate a submitted order.

Why: fully normalized tables make every new axis kind a migration — hostile to a
self-serve tenant catalog (ADR 0006, 0009). Fully JSONB loses FK integrity to SKUs
and assets. The hybrid keeps integrity where it matters and flexibility where the
shape genuinely varies. Snapshotting designs/POs decouples order history from an
evolving catalog.
