-- Init catalog schema — the v1 data model.
--
-- Materializes: a relational catalog core, validated-JSONB config columns, and
-- snapshot rows for designs/POs. Storage is hybrid per ADR 0014 — FK integrity
-- where it matters, JSONB where the shape genuinely varies per part type. JSONB
-- shapes are validated app-side (zod, lib/catalog/), since Postgres does not
-- enforce JSONB structure.
--
-- Everything is scoped by `company` from day one — single-tenant v1, multi-tenant
-- end state, no global singletons (ADR 0006).
--
-- See docs/PLAN.md "Catalog schema" and ADRs 0005-0031.

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ── stable value sets (enums) ───────────────────────────────────────────────
-- part_type is the deliberately-small v1 part set (ADR 0008); adding a part later
-- is a conscious ALTER TYPE, which is fine. rail_system is intentionally NOT an
-- enum — it is plain text so a second value (over_the_post) is addable without a
-- migration (ADR 0028).
create type part_type as enum (
  'tread', 'riser', 'baluster', 'handrail', 'newel', 'shoe_rail', 'fillet', 'cap'
);
create type stocking_rule as enum ('fixed', 'stock_lengths', 'cut_to_size');  -- ADR 0010
create type material_kind as enum ('species', 'finish');                     -- ADR 0011/0012
create type splice_policy as enum ('continuous', 'spliceable');              -- ADR 0024

-- ── company (tenant) ────────────────────────────────────────────────────────
create table company (
  id                                  uuid primary key default gen_random_uuid(),
  slug                                text not null unique,
  name                                text not null,
  -- default Primary Species (a species-kind material) that seeds new Designs
  -- (ADR 0021). FK added after `material` exists (circular ref); nullable so a
  -- company can be inserted before its materials.
  default_primary_species_material_id uuid,
  -- the single seller address a submitted PO/RFQ emails to (ADR 0025).
  rfq_recipient_email                 text,
  -- manufacturing quantization increment, inches. Single v1 constant, modeled
  -- company-scoped so it can go per-shop later without a migration (ADR 0022).
  quantize_increment_inch             numeric not null default 0.0625,
  created_at                          timestamptz not null default now(),
  updated_at                          timestamptz not null default now()
);

-- ── material (a PBR species/finish value), company-scoped ────────────────────
-- Authored once and shared across products/SKUs; geometry and material are
-- orthogonal (ADR 0012). `kind = 'species'` participates in Primary-Species
-- coordination; 'finish' (metal/paint-grade) does not (ADR 0011).
create table material (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references company(id) on delete cascade,
  code         text not null,
  display_name text not null,
  kind         material_kind not null,
  -- PBR/texture spec, validated app-side (MaterialRender).
  render       jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (company_id, code)
);

alter table company
  add constraint company_default_species_fk
  foreign key (default_primary_species_material_id)
  references material(id) on delete set null;

-- ── gltf_asset (authored model pointer in Supabase storage) ──────────────────
create table gltf_asset (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references company(id) on delete cascade,
  storage_path text not null,
  display_name text,
  created_at   timestamptz not null default now(),
  unique (company_id, storage_path)
);

-- ── style (ornamental geometry family: baluster/newel) ───────────────────────
-- Boxy parts use a procedural profile id on the SKU instead of a style (ADR 0012).
create table style (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references company(id) on delete cascade,
  code              text not null,
  display_name      text not null,
  part_type         part_type not null,  -- ornamental only (baluster | newel)
  gltf_asset_id     uuid not null references gltf_asset(id),
  -- base/top anchors, scalable axis, fixed-detail zones (ADR 0012), app-validated.
  anchor_scale_spec jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  unique (company_id, code)
);

-- ── product (a configurable family of one part type) ─────────────────────────
-- Declares option axes + dimension bindings; the configurator renders its side
-- panel from these (ADR 0009/0010).
create table product (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references company(id) on delete cascade,
  code                text not null,
  display_name        text not null,
  part_type           part_type not null,
  -- user-facing discrete dropdowns (species/profile/style) (ADR 0009/0011), app-validated.
  selection_axes      jsonb not null default '{}'::jsonb,
  -- physical dims → geometry/fixed value + stocking rule (ADR 0010), app-validated.
  dimension_bindings  jsonb not null default '{}'::jsonb,
  -- reserved compatibility keys, unenforced in v1 (ADR 0013), app-validated.
  match_keys          jsonb not null default '{}'::jsonb,
  -- rail-system membership; plain text so OTP is addable without a migration (ADR 0028).
  rail_system         text not null default 'post_to_post',
  -- linear-part splice policy (ADR 0024). Null for non-linear parts.
  splice_policy       splice_policy,
  -- curated default that seeds the first Design (ADR 0021): default SKU + default
  -- axis values. FK to sku added after `sku` exists (circular ref); nullable.
  default_sku_id      uuid,
  default_axis_values jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (company_id, code)
);

-- ── sku (the orderable resolution of a product's axis values) ────────────────
-- Each SKU row IS an entry in the product→sku "which axis combinations are real"
-- mapping (ADR 0009): its `axis_values` records the combination it realizes.
-- References a geometry (style OR procedural profile) + a material; no price (ADR 0005).
create table sku (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references company(id) on delete cascade,
  product_id       uuid not null references product(id) on delete cascade,
  code             text not null,
  -- geometry source: exactly one of an ornamental style OR a procedural profile id.
  style_id         uuid references style(id),
  profile          text,
  material_id      uuid not null references material(id),
  -- rail-system membership on every SKU from day one (ADR 0028).
  rail_system      text not null default 'post_to_post',
  -- the axis-value combination this SKU realizes (ADR 0009), app-validated.
  axis_values      jsonb not null default '{}'::jsonb,
  -- fixed stock dimensions, inches (ADR 0010), app-validated.
  stock_dimensions jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  unique (company_id, code),
  constraint sku_one_geometry_source
    check ((style_id is not null) <> (profile is not null))
);

alter table product
  add constraint product_default_sku_fk
  foreign key (default_sku_id) references sku(id) on delete set null;

-- ── design (live editable snapshot, Share-Link addressed) ────────────────────
-- Autosaves continuously from the first edit (ADR 0020). The row `id` doubles as
-- the unguessable Share-Link token — the only access control in v1 (ADR 0006/0020).
create table design (
  id                            uuid primary key default gen_random_uuid(),
  company_id                    uuid not null references company(id),
  -- optimistic-concurrency guard against silent clobber of a forwarded draft (ADR 0029).
  version                       integer not null default 1,
  -- spatial Intake inputs (ADR 0027): rise + ceiling required; the rest optional /
  -- defaulted. Exact decimal inches — the engine never sees a fraction (ADR 0022).
  total_rise_inch               numeric not null,
  ceiling_height_inch           numeric not null,
  run_length_inch               numeric,
  width_inch                    numeric not null default 42,
  stairwell_opening_length_inch numeric,
  -- defaulted Primary Species; cascades to wood parts, overridable (ADR 0011/0021).
  primary_species_material_id   uuid references material(id),
  -- per-product chosen axis values + per-part material overrides (ADR 0011), app-validated.
  selections                    jsonb not null default '{}'::jsonb,
  -- engine-resolved dimensions + derived counts for the working design, app-validated.
  resolved                      jsonb not null default '{}'::jsonb,
  -- advisory-override flags (ADR 0003/0019), app-validated.
  advisory_overrides            jsonb not null default '{}'::jsonb,
  -- set when a PO freezes this design read-only (ADR 0020). Enforced app-side.
  submitted_at                  timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

-- ── purchase_order (the frozen RFQ snapshot) ─────────────────────────────────
-- Immutable at submit; later catalog/design edits never mutate it (ADR 0014).
-- Price-free — functions as an RFQ in v1 (ADR 0025).
create table purchase_order (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references company(id),
  -- one Design ↔ one PO (ADR 0020).
  design_id       uuid not null unique references design(id),
  -- frozen resolved SKU line-items (sku code, qty, cut dims) — a self-contained
  -- snapshot decoupled from an evolving catalog (ADR 0014), app-validated.
  line_items      jsonb not null default '[]'::jsonb,
  -- active advisory warnings frozen at submit; print on both emails (ADR 0026), app-validated.
  frozen_warnings jsonb not null default '[]'::jsonb,
  -- required buyer contact (ADR 0025): name + email required; phone/zip optional.
  buyer_name      text not null,
  buyer_email     text not null,
  buyer_phone     text,
  buyer_zip       text,
  -- one-tap acknowledgment recorded when warnings were active at submit (ADR 0026);
  -- null when there were none.
  acknowledged_at timestamptz,
  submitted_at    timestamptz not null default now()
);

-- ── indexes for the hot company/parent lookups ──────────────────────────────
create index material_company_idx        on material (company_id);
create index gltf_asset_company_idx       on gltf_asset (company_id);
create index style_company_idx            on style (company_id);
create index product_company_idx          on product (company_id);
create index sku_company_idx              on sku (company_id);
create index sku_product_idx              on sku (product_id);
create index design_company_idx           on design (company_id);
create index purchase_order_company_idx   on purchase_order (company_id);

-- ── row-level security ──────────────────────────────────────────────────────
-- Enable RLS on every table with NO policies: the anon/public API key can read or
-- write nothing. All configurator reads/writes go through server routes using the
-- service-role key, which bypasses RLS (ADR 0032 keeps that key server-only). Access
-- control to a Design is the unguessable Share-Link UUID enforced in those routes
-- (ADR 0006/0020). Deliberate anon policies can be added later if direct-from-client
-- access is ever wanted.
alter table company        enable row level security;
alter table material       enable row level security;
alter table gltf_asset     enable row level security;
alter table style          enable row level security;
alter table product        enable row level security;
alter table sku            enable row level security;
alter table design         enable row level security;
alter table purchase_order enable row level security;
