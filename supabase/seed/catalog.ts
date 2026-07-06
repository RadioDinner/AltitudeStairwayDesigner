/**
 * Placeholder catalog — the curated, internally-compatible v1 seed (build-path
 * step 2). One seeded Company, a single post-to-post rail system (ADR 0028), and a
 * handful of SKUs per part type across the v1 part set (ADR 0008): treads, risers,
 * balusters, handrail, newels + fillets, shoe rails, caps.
 *
 * This module is the SOURCE OF TRUTH. Every JSONB payload is validated against the
 * `lib/catalog/` zod schemas at load (throws on mismatch), and cross-checks assert
 * the catalog is coherent (defaults resolve, materials/styles referenced by SKUs are
 * actually offered by their product). `build.ts` emits `supabase/seed.sql` from it.
 *
 * Real seller SKUs replace this later; the shapes stay (ADR 0002 catalog-sourcing risk).
 */
import {
  SelectionAxes,
  DimensionBindings,
  MatchKeys,
  DefaultAxisValues,
  AxisValues,
  StockDimensions,
  AnchorScaleSpec,
  MaterialRender,
  type PartType,
  type SplicePolicy,
} from "../../lib/catalog/index";

// ── deterministic, valid-v4-shaped UUIDs from a semantic name ────────────────
// Stable across runs so regenerating seed.sql produces clean diffs; no randomness.
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function hex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, "0");
}
export function makeId(name: string): string {
  const s = hex8(fnv1a(name)) + hex8(fnv1a(name + "#1")) + hex8(fnv1a(name + "#2")) + hex8(fnv1a(name + "#3"));
  // 8-4-4-4-12 with version nibble 4 and variant nibble 8 → passes strict uuid too.
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-8${s.slice(17, 20)}-${s.slice(20, 32)}`;
}

// ── company ──────────────────────────────────────────────────────────────────
const COMPANY_SLUG = "altitude-demo";
export const company = {
  id: makeId("company:altitude-demo"),
  slug: COMPANY_SLUG,
  name: "Altitude Demo Stairworks",
  rfq_recipient_email: "rfq@altitude-demo.example",
  quantize_increment_inch: 0.0625,
  default_species_code: "red_oak", // resolved to a material id in build order
};

// ── materials (species + finish), authored once, company-scoped ──────────────
type MaterialSeed = {
  code: string;
  display_name: string;
  kind: "species" | "finish";
  render: unknown;
};
const materialSeeds: MaterialSeed[] = [
  { code: "red_oak", display_name: "Red Oak", kind: "species", render: { baseColorHex: "#b5895a", roughness: 0.6, metalness: 0 } },
  { code: "hard_maple", display_name: "Hard Maple", kind: "species", render: { baseColorHex: "#e6d2a8", roughness: 0.55, metalness: 0 } },
  { code: "poplar", display_name: "Poplar (Paint-Grade)", kind: "species", render: { baseColorHex: "#d8d3b8", roughness: 0.7, metalness: 0 } },
  { code: "satin_black_iron", display_name: "Satin Black Iron", kind: "finish", render: { baseColorHex: "#1c1c1e", roughness: 0.4, metalness: 1 } },
  { code: "oil_rubbed_bronze", display_name: "Oil-Rubbed Bronze", kind: "finish", render: { baseColorHex: "#3b2a20", roughness: 0.35, metalness: 1 } },
];
export const materials = materialSeeds.map((m) => ({
  id: makeId(`material:${m.code}`),
  company_id: company.id,
  ...m,
  render: MaterialRender.parse(m.render),
}));
const materialId = (code: string): string => {
  const m = materials.find((x) => x.code === code);
  if (!m) throw new Error(`unknown material code: ${code}`);
  return m.id;
};

// ── gltf assets (ornamental models) ──────────────────────────────────────────
const assetSeeds = [
  { key: "baluster/colonial", path: "catalog/baluster/colonial.glb", name: "Colonial Baluster" },
  { key: "baluster/pin-top", path: "catalog/baluster/pin-top.glb", name: "Pin-Top Baluster" },
  { key: "baluster/twist", path: "catalog/baluster/twist.glb", name: "Twist Baluster" },
  { key: "newel/box", path: "catalog/newel/box.glb", name: "Box Newel" },
  { key: "newel/turned", path: "catalog/newel/turned.glb", name: "Turned Newel" },
];
export const gltfAssets = assetSeeds.map((a) => ({
  id: makeId(`gltf:${a.key}`),
  company_id: company.id,
  storage_path: a.path,
  display_name: a.name,
}));
const assetId = (key: string): string => {
  const a = gltfAssets.find((x) => x.storage_path === `catalog/${key}.glb`);
  if (!a) throw new Error(`unknown asset key: ${key}`);
  return a.id;
};

// ── styles (ornamental geometry families: baluster/newel) ────────────────────
type StyleSeed = {
  code: string;
  display_name: string;
  part_type: Extract<PartType, "baluster" | "newel">;
  assetKey: string;
  anchor_scale_spec: unknown;
};
// scalable along y (height); base + finial detail zones held fixed (ADR 0012).
const balusterSpec = {
  baseAnchor: { x: 0, y: 0, z: 0 },
  topAnchor: { x: 0, y: 36, z: 0 },
  scalableAxis: "y",
  fixedDetailZones: [
    { axis: "y", fromInch: 0, toInch: 2 },
    { axis: "y", fromInch: 34, toInch: 36 },
  ],
};
const newelSpec = {
  baseAnchor: { x: 0, y: 0, z: 0 },
  topAnchor: { x: 0, y: 60, z: 0 },
  scalableAxis: "y",
  fixedDetailZones: [
    { axis: "y", fromInch: 0, toInch: 4 },
    { axis: "y", fromInch: 56, toInch: 60 },
  ],
};
const styleSeeds: StyleSeed[] = [
  { code: "colonial", display_name: "Colonial", part_type: "baluster", assetKey: "baluster/colonial", anchor_scale_spec: balusterSpec },
  { code: "pin_top", display_name: "Pin-Top", part_type: "baluster", assetKey: "baluster/pin-top", anchor_scale_spec: balusterSpec },
  { code: "twist", display_name: "Twist", part_type: "baluster", assetKey: "baluster/twist", anchor_scale_spec: balusterSpec },
  { code: "box", display_name: "Box Newel", part_type: "newel", assetKey: "newel/box", anchor_scale_spec: newelSpec },
  { code: "turned", display_name: "Turned Newel", part_type: "newel", assetKey: "newel/turned", anchor_scale_spec: newelSpec },
];
export const styles = styleSeeds.map((s) => ({
  id: makeId(`style:${s.part_type}:${s.code}`),
  company_id: company.id,
  code: s.code,
  display_name: s.display_name,
  part_type: s.part_type,
  gltf_asset_id: assetId(s.assetKey),
  anchor_scale_spec: AnchorScaleSpec.parse(s.anchor_scale_spec),
}));
const styleId = (partType: string, code: string): string => {
  const s = styles.find((x) => x.part_type === partType && x.code === code);
  if (!s) throw new Error(`unknown style: ${partType}/${code}`);
  return s.id;
};

// ── products + skus ──────────────────────────────────────────────────────────
// A geometry source is a procedural `profile` (boxy parts) OR a `style_id`
// (ornamental) — never both (the sku CHECK enforces exactly one, ADR 0012).
type SkuSeed = {
  code: string;
  material: string;
  profile?: string;
  style?: string; // style code (ornamental)
  axis_values: Record<string, string>;
  stock_dimensions: Record<string, number>;
};
type ProductSeed = {
  code: string;
  display_name: string;
  part_type: PartType;
  splice_policy: SplicePolicy | null;
  selection_axes: unknown;
  dimension_bindings: unknown;
  default_axis_values: Record<string, string>;
  default_sku_code: string;
  skus: SkuSeed[];
};

// helpers for axis option lists
const speciesOpt = (code: string) => ({ value: code, label: displayName(code), materialId: materialId(code) });
const materialOpt = (code: string) => ({ value: code, label: displayName(code), materialId: materialId(code) });
const styleOpt = (partType: string, code: string) => ({ value: code, label: styleName(code), styleId: styleId(partType, code) });
const profileOpt = (value: string, label: string) => ({ value, label });
function displayName(code: string): string {
  return materials.find((m) => m.code === code)?.display_name ?? code;
}
function styleName(code: string): string {
  return styles.find((s) => s.code === code)?.display_name ?? code;
}

const RAIL = "post_to_post";

const productSeeds: ProductSeed[] = [
  {
    code: "tread_bullnose",
    display_name: "Bullnose Tread",
    part_type: "tread",
    splice_policy: null,
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
      { key: "profile", kind: "profile", label: "Nosing Profile", options: [profileOpt("bullnose", "Bullnose")] },
    ] },
    dimension_bindings: {
      length: { source: { kind: "geometry", ref: "stair_width" }, stockingRule: "cut_to_size", minInch: 36, maxInch: 60 },
      depth: { source: { kind: "geometry", ref: "tread_depth" }, stockingRule: "cut_to_size" }, // = Run + nosing (ADR 0031)
      thickness: { source: { kind: "fixed", valueInch: 1.0 }, stockingRule: "fixed" },
      nosing: { source: { kind: "fixed", valueInch: 1.0 }, stockingRule: "fixed" }, // per-profile nosing invariant (ADR 0031)
    },
    default_axis_values: { species: "red_oak", profile: "bullnose" },
    default_sku_code: "TRD-BN-RO",
    skus: [
      { code: "TRD-BN-RO", material: "red_oak", profile: "bullnose_tread", axis_values: { species: "red_oak", profile: "bullnose" }, stock_dimensions: { thicknessInch: 1.0, nosingInch: 1.0 } },
      { code: "TRD-BN-HM", material: "hard_maple", profile: "bullnose_tread", axis_values: { species: "hard_maple", profile: "bullnose" }, stock_dimensions: { thicknessInch: 1.0, nosingInch: 1.0 } },
    ],
  },
  {
    code: "riser_square",
    display_name: "Square Riser",
    part_type: "riser",
    splice_policy: null,
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple"), speciesOpt("poplar")] },
      { key: "profile", kind: "profile", label: "Profile", options: [profileOpt("square", "Square")] },
    ] },
    dimension_bindings: {
      height: { source: { kind: "geometry", ref: "rise" }, stockingRule: "cut_to_size" },
      length: { source: { kind: "geometry", ref: "stair_width" }, stockingRule: "cut_to_size", minInch: 36, maxInch: 60 },
      thickness: { source: { kind: "fixed", valueInch: 0.75 }, stockingRule: "fixed" },
    },
    default_axis_values: { species: "red_oak", profile: "square" },
    default_sku_code: "RIS-SQ-RO",
    skus: [
      { code: "RIS-SQ-RO", material: "red_oak", profile: "square_riser", axis_values: { species: "red_oak", profile: "square" }, stock_dimensions: { thicknessInch: 0.75 } },
      { code: "RIS-SQ-HM", material: "hard_maple", profile: "square_riser", axis_values: { species: "hard_maple", profile: "square" }, stock_dimensions: { thicknessInch: 0.75 } },
      { code: "RIS-SQ-PP", material: "poplar", profile: "square_riser", axis_values: { species: "poplar", profile: "square" }, stock_dimensions: { thicknessInch: 0.75 } },
    ],
  },
  {
    code: "baluster_v1",
    display_name: "Baluster",
    part_type: "baluster",
    splice_policy: null,
    // balusters offer both wood species and metal finishes (ADR 0011) → 'material' axis.
    selection_axes: { axes: [
      { key: "style", kind: "style", label: "Style", options: [styleOpt("baluster", "colonial"), styleOpt("baluster", "pin_top"), styleOpt("baluster", "twist")] },
      { key: "material", kind: "material", label: "Material", options: [materialOpt("red_oak"), materialOpt("hard_maple"), materialOpt("satin_black_iron"), materialOpt("oil_rubbed_bronze")] },
    ] },
    dimension_bindings: {
      height: { source: { kind: "geometry", ref: "baluster_height" }, stockingRule: "cut_to_size", minInch: 30, maxInch: 44 },
      section: { source: { kind: "fixed", valueInch: 1.25 }, stockingRule: "fixed" },
    },
    default_axis_values: { style: "colonial", material: "red_oak" },
    default_sku_code: "BAL-COL-RO",
    skus: [
      { code: "BAL-COL-RO", material: "red_oak", style: "colonial", axis_values: { style: "colonial", material: "red_oak" }, stock_dimensions: { sectionInch: 1.25 } },
      { code: "BAL-COL-HM", material: "hard_maple", style: "colonial", axis_values: { style: "colonial", material: "hard_maple" }, stock_dimensions: { sectionInch: 1.25 } },
      { code: "BAL-PIN-IR", material: "satin_black_iron", style: "pin_top", axis_values: { style: "pin_top", material: "satin_black_iron" }, stock_dimensions: { sectionInch: 0.5 } },
      { code: "BAL-TWI-ORB", material: "oil_rubbed_bronze", style: "twist", axis_values: { style: "twist", material: "oil_rubbed_bronze" }, stock_dimensions: { sectionInch: 0.5 } },
    ],
  },
  {
    code: "handrail_colonial",
    display_name: "Colonial Handrail",
    part_type: "handrail",
    splice_policy: "continuous", // one continuous piece; over-max → Fit warning (ADR 0024)
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
      { key: "profile", kind: "profile", label: "Profile", options: [profileOpt("colonial_rail", "Colonial")] },
    ] },
    dimension_bindings: {
      length: { source: { kind: "geometry", ref: "flight_length" }, stockingRule: "cut_to_size", maxInch: 192 },
      width: { source: { kind: "fixed", valueInch: 2.5 }, stockingRule: "fixed" },
      height: { source: { kind: "fixed", valueInch: 2.625 }, stockingRule: "fixed" },
    },
    default_axis_values: { species: "red_oak", profile: "colonial_rail" },
    default_sku_code: "HDR-COL-RO",
    skus: [
      { code: "HDR-COL-RO", material: "red_oak", profile: "colonial_rail", axis_values: { species: "red_oak", profile: "colonial_rail" }, stock_dimensions: { widthInch: 2.5, heightInch: 2.625 } },
      { code: "HDR-COL-HM", material: "hard_maple", profile: "colonial_rail", axis_values: { species: "hard_maple", profile: "colonial_rail" }, stock_dimensions: { widthInch: 2.5, heightInch: 2.625 } },
    ],
  },
  {
    code: "newel_v1",
    display_name: "Newel Post",
    part_type: "newel",
    splice_policy: null,
    selection_axes: { axes: [
      { key: "style", kind: "style", label: "Style", options: [styleOpt("newel", "box"), styleOpt("newel", "turned")] },
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
    ] },
    dimension_bindings: {
      height: { source: { kind: "geometry", ref: "newel_height" }, stockingRule: "cut_to_size", minInch: 48, maxInch: 72 },
      section: { source: { kind: "fixed", valueInch: 3.5 }, stockingRule: "fixed" },
    },
    default_axis_values: { style: "box", species: "red_oak" },
    default_sku_code: "NWL-BOX-RO",
    skus: [
      { code: "NWL-BOX-RO", material: "red_oak", style: "box", axis_values: { style: "box", species: "red_oak" }, stock_dimensions: { sectionInch: 3.5 } },
      { code: "NWL-TRN-RO", material: "red_oak", style: "turned", axis_values: { style: "turned", species: "red_oak" }, stock_dimensions: { sectionInch: 3.5 } },
      { code: "NWL-BOX-HM", material: "hard_maple", style: "box", axis_values: { style: "box", species: "hard_maple" }, stock_dimensions: { sectionInch: 3.5 } },
    ],
  },
  {
    code: "fillet_plowed",
    display_name: "Plowed Fillet",
    part_type: "fillet",
    splice_policy: "spliceable",
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
      { key: "profile", kind: "profile", label: "Profile", options: [profileOpt("plowed_fillet", "Plowed")] },
    ] },
    dimension_bindings: {
      length: { source: { kind: "geometry", ref: "fillet_run" }, stockingRule: "stock_lengths", stockLengthsInch: [48] },
      width: { source: { kind: "fixed", valueInch: 0.75 }, stockingRule: "fixed" },
      height: { source: { kind: "fixed", valueInch: 0.75 }, stockingRule: "fixed" },
    },
    default_axis_values: { species: "red_oak", profile: "plowed_fillet" },
    default_sku_code: "FIL-RO",
    skus: [
      { code: "FIL-RO", material: "red_oak", profile: "plowed_fillet", axis_values: { species: "red_oak", profile: "plowed_fillet" }, stock_dimensions: { widthInch: 0.75, heightInch: 0.75 } },
      { code: "FIL-HM", material: "hard_maple", profile: "plowed_fillet", axis_values: { species: "hard_maple", profile: "plowed_fillet" }, stock_dimensions: { widthInch: 0.75, heightInch: 0.75 } },
    ],
  },
  {
    code: "shoe_rail_plowed",
    display_name: "Plowed Shoe Rail",
    part_type: "shoe_rail",
    splice_policy: "spliceable",
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
      { key: "profile", kind: "profile", label: "Profile", options: [profileOpt("plowed_shoe", "Plowed")] },
    ] },
    dimension_bindings: {
      length: { source: { kind: "geometry", ref: "flight_length" }, stockingRule: "stock_lengths", stockLengthsInch: [96, 120, 144] },
      width: { source: { kind: "fixed", valueInch: 1.75 }, stockingRule: "fixed" },
      height: { source: { kind: "fixed", valueInch: 1.0 }, stockingRule: "fixed" },
    },
    default_axis_values: { species: "red_oak", profile: "plowed_shoe" },
    default_sku_code: "SHO-RO",
    skus: [
      { code: "SHO-RO", material: "red_oak", profile: "plowed_shoe", axis_values: { species: "red_oak", profile: "plowed_shoe" }, stock_dimensions: { widthInch: 1.75, heightInch: 1.0 } },
      { code: "SHO-HM", material: "hard_maple", profile: "plowed_shoe", axis_values: { species: "hard_maple", profile: "plowed_shoe" }, stock_dimensions: { widthInch: 1.75, heightInch: 1.0 } },
    ],
  },
  {
    code: "cap_flat",
    display_name: "Flat Newel Cap",
    part_type: "cap",
    splice_policy: null,
    selection_axes: { axes: [
      { key: "species", kind: "species", label: "Species", options: [speciesOpt("red_oak"), speciesOpt("hard_maple")] },
      { key: "profile", kind: "profile", label: "Profile", options: [profileOpt("flat_cap", "Flat")] },
    ] },
    dimension_bindings: {
      length: { source: { kind: "fixed", valueInch: 3.5 }, stockingRule: "fixed" },
      width: { source: { kind: "fixed", valueInch: 3.5 }, stockingRule: "fixed" },
      thickness: { source: { kind: "fixed", valueInch: 1.0 }, stockingRule: "fixed" },
    },
    default_axis_values: { species: "red_oak", profile: "flat_cap" },
    default_sku_code: "CAP-RO",
    skus: [
      { code: "CAP-RO", material: "red_oak", profile: "flat_cap", axis_values: { species: "red_oak", profile: "flat_cap" }, stock_dimensions: { lengthInch: 3.5, widthInch: 3.5, thicknessInch: 1.0 } },
      { code: "CAP-HM", material: "hard_maple", profile: "flat_cap", axis_values: { species: "hard_maple", profile: "flat_cap" }, stock_dimensions: { lengthInch: 3.5, widthInch: 3.5, thicknessInch: 1.0 } },
    ],
  },
];

// ── validate + materialize (throws on any invalid JSONB or incoherent default) ─
export const products = productSeeds.map((p) => {
  const productId = makeId(`product:${p.code}`);
  // JSONB shape validation (ADR 0014)
  SelectionAxes.parse(p.selection_axes);
  DimensionBindings.parse(p.dimension_bindings);
  MatchKeys.parse({});
  DefaultAxisValues.parse(p.default_axis_values);

  const skus = p.skus.map((s) => {
    AxisValues.parse(s.axis_values);
    StockDimensions.parse(s.stock_dimensions);
    if ((s.profile == null) === (s.style == null)) {
      throw new Error(`sku ${s.code}: exactly one of profile|style required`);
    }
    return {
      id: makeId(`sku:${s.code}`),
      company_id: company.id,
      product_id: productId,
      code: s.code,
      style_id: s.style ? styleId(p.part_type, s.style) : null,
      profile: s.profile ?? null,
      material_id: materialId(s.material),
      rail_system: RAIL,
      axis_values: s.axis_values,
      stock_dimensions: s.stock_dimensions,
    };
  });

  const defaultSku = skus.find((s) => s.code === p.default_sku_code);
  if (!defaultSku) throw new Error(`product ${p.code}: default sku ${p.default_sku_code} not found`);

  return {
    id: productId,
    company_id: company.id,
    code: p.code,
    display_name: p.display_name,
    part_type: p.part_type,
    selection_axes: p.selection_axes,
    dimension_bindings: p.dimension_bindings,
    match_keys: {},
    rail_system: RAIL,
    splice_policy: p.splice_policy,
    default_axis_values: p.default_axis_values,
    default_sku_id: defaultSku.id,
    skus,
  };
});

// ── coherence cross-checks (beyond zod) ──────────────────────────────────────
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`catalog coherence: ${msg}`);
}

const primarySpecies = materials.find((m) => m.code === company.default_species_code);
assert(primarySpecies, `company default species '${company.default_species_code}' is not a material`);
assert(primarySpecies!.kind === "species", `company default species must be kind=species`);

for (const p of products) {
  const axes = (p.selection_axes as { axes: { key: string; kind: string; options: { value: string; materialId?: string; styleId?: string }[] }[] }).axes;
  const materialAxis = axes.find((a) => a.kind === "species" || a.kind === "material");
  const styleAxis = axes.find((a) => a.kind === "style");

  // default axis values must name real options on their axes
  for (const [k, v] of Object.entries(p.default_axis_values)) {
    const axis = axes.find((a) => a.key === k);
    assert(axis, `product ${p.code}: default axis '${k}' not declared`);
    assert(axis!.options.some((o) => o.value === v), `product ${p.code}: default '${k}=${v}' not an option`);
  }
  // the default sku's axis values must equal the product default (ADR 0021)
  const dsku = p.skus.find((s) => s.id === p.default_sku_id)!;
  assert(
    JSON.stringify(dsku.axis_values) === JSON.stringify(p.default_axis_values),
    `product ${p.code}: default sku axis_values must match default_axis_values`,
  );

  for (const s of p.skus) {
    // every sku's material must be offered by the product's material/species axis
    assert(materialAxis, `product ${p.code}: no material axis but sku ${s.code} has a material`);
    assert(
      materialAxis!.options.some((o) => o.materialId === s.material_id),
      `product ${p.code}: sku ${s.code} material not offered by axis`,
    );
    // ornamental skus' style must be offered by the style axis
    if (s.style_id) {
      assert(styleAxis, `product ${p.code}: sku ${s.code} has style but product has no style axis`);
      assert(styleAxis!.options.some((o) => o.styleId === s.style_id), `product ${p.code}: sku ${s.code} style not offered`);
    }
  }
}

// primary species must cascade: every wood product (has a species/material axis
// listing red_oak) can default to it (ADR 0011). At minimum the wood-bearing
// products offer it.
for (const p of products) {
  const axes = (p.selection_axes as { axes: { kind: string; options: { materialId?: string }[] }[] }).axes;
  const matAxis = axes.find((a) => a.kind === "species" || a.kind === "material");
  if (matAxis && matAxis.options.some((o) => o.materialId === primarySpecies!.id)) {
    // ok — coordinates on Primary Species
  }
}

export const catalog = { company, materials, gltfAssets, styles, products, primarySpeciesId: primarySpecies!.id };
