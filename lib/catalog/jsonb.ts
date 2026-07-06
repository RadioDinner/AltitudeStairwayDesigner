import { z } from "zod";
import { PartType, StockingRule, RailSystem } from "./enums";

/**
 * App-side validators for the catalog's JSONB columns (ADR 0014). Postgres does not
 * enforce JSONB structure, so these are the contract at the read/write edge.
 *
 * Well-understood shapes are validated strictly; shapes the generation engine (the
 * next build step) will finalize are marked "firming" and use `looseObject` so they
 * tolerate extra keys instead of rejecting engine output we haven't modeled yet.
 */

const inch = z.number();

// ── material.render — PBR/texture spec (firming; ADR 0012) ───────────────────
export const MaterialRender = z.looseObject({
  baseColorHex: z.string().optional(),
  roughness: z.number().min(0).max(1).optional(),
  metalness: z.number().min(0).max(1).optional(),
  textureAssetPath: z.string().optional(),
});
export type MaterialRender = z.infer<typeof MaterialRender>;

// ── style.anchor_scale_spec — anchors + scalable axis + fixed zones (ADR 0012) ─
const Vec3 = z.object({ x: z.number(), y: z.number(), z: z.number() });
const Axis3 = z.enum(["x", "y", "z"]);
export const AnchorScaleSpec = z.looseObject({
  baseAnchor: Vec3.optional(),
  topAnchor: Vec3.optional(),
  scalableAxis: Axis3.optional(),
  fixedDetailZones: z
    .array(z.object({ axis: Axis3, fromInch: inch, toInch: inch }))
    .optional(),
});
export type AnchorScaleSpec = z.infer<typeof AnchorScaleSpec>;

// ── product.selection_axes — user-facing dropdowns (ADR 0009/0010/0011) ──────
export const AxisKind = z.enum(["species", "material", "profile", "style"]);
export const SelectionAxisOption = z.object({
  value: z.string(),
  label: z.string().optional(),
  // guid (not the version-checked uuid): tolerant of hand-authored catalog seed ids
  // while still enforcing the 8-4-4-4-12 hex layout. DB-generated v4 ids pass too.
  materialId: z.guid().optional(), // set when kind is species | material
  styleId: z.guid().optional(), // set when kind is style
});
export const SelectionAxis = z.object({
  key: z.string(),
  kind: AxisKind,
  label: z.string().optional(),
  options: z.array(SelectionAxisOption),
});
export const SelectionAxes = z.object({
  axes: z.array(SelectionAxis).default([]),
});
export type SelectionAxes = z.infer<typeof SelectionAxes>;

// ── product.dimension_bindings — dims → geometry/fixed + stocking rule (ADR 0010) ─
export const DimensionSource = z.union([
  // bound to a value derived from the stair geometry (e.g. stair_width, flight_length)
  z.object({ kind: z.literal("geometry"), ref: z.string() }),
  // a fixed value independent of the stair
  z.object({ kind: z.literal("fixed"), valueInch: inch }),
]);
export const DimensionBinding = z.object({
  source: DimensionSource,
  stockingRule: StockingRule,
  minInch: inch.optional(),
  maxInch: inch.optional(),
  stockLengthsInch: z.array(inch).optional(), // used when stockingRule = stock_lengths
});
export const DimensionBindings = z.record(z.string(), DimensionBinding);
export type DimensionBindings = z.infer<typeof DimensionBindings>;

// ── product.match_keys — reserved compatibility keys, unenforced in v1 (ADR 0013) ─
export const MatchKeys = z.record(z.string(), z.unknown());
export type MatchKeys = z.infer<typeof MatchKeys>;

// ── product.default_axis_values — curated default per product (ADR 0021) ─────
export const DefaultAxisValues = z.record(z.string(), z.string());
export type DefaultAxisValues = z.infer<typeof DefaultAxisValues>;

// ── sku.axis_values — the combination this SKU realizes (ADR 0009) ───────────
export const AxisValues = z.record(z.string(), z.string());
export type AxisValues = z.infer<typeof AxisValues>;

// ── sku.stock_dimensions — fixed stock dims, inches (ADR 0010) ───────────────
export const StockDimensions = z.record(z.string(), inch);
export type StockDimensions = z.infer<typeof StockDimensions>;

// ── design.selections — per-product picks + per-part species override (ADR 0011) ─
export const ProductSelection = z.object({
  axisValues: z.record(z.string(), z.string()).default({}),
  materialOverrideId: z.guid().optional(), // overrides the cascaded Primary Species
});
export const DesignSelections = z.record(z.string(), ProductSelection);
export type DesignSelections = z.infer<typeof DesignSelections>;

// ── design.resolved — engine output snapshot (firming; owned by the engine step) ─
export const ResolvedDesign = z.looseObject({
  riserCount: z.number().int().optional(),
  riseInch: inch.optional(),
  runInch: inch.optional(),
  treadCount: z.number().int().optional(),
  treadDepthInch: inch.optional(), // = Run + nosing (ADR 0031)
  balustersPerTread: z.number().int().optional(),
  handrailLengthInch: inch.optional(),
});
export type ResolvedDesign = z.infer<typeof ResolvedDesign>;

// ── design.advisory_overrides — override flags (ADR 0003/0019) ───────────────
export const AdvisoryOverrides = z.record(z.string(), z.boolean());
export type AdvisoryOverrides = z.infer<typeof AdvisoryOverrides>;

// ── purchase_order.frozen_warnings — Code/Fit warnings frozen at submit (ADR 0026) ─
export const WarningCategory = z.enum(["code", "fit"]);
export const Warning = z.object({
  code: z.string(), // e.g. "max_rise", "min_run", "headroom", "handrail_too_long"
  category: WarningCategory,
  message: z.string(),
});
export const FrozenWarnings = z.array(Warning);
export type Warning = z.infer<typeof Warning>;

// ── purchase_order.line_items — frozen resolved SKU lines (ADR 0014/0022) ────
export const LineItem = z.object({
  skuCode: z.string(),
  partType: PartType,
  quantity: z.number().int().nonnegative(),
  // quantized to the shop increment at the PO edge (ADR 0022), inches.
  cutDimensionsInch: z.record(z.string(), inch).default({}),
  railSystem: RailSystem.optional(),
});
export const LineItems = z.array(LineItem);
export type LineItem = z.infer<typeof LineItem>;

// ── buyer contact — captured/required at submit (ADR 0025). Columns, not JSONB,
// but validated here so the submit route shares one contract. ────────────────
export const BuyerContact = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  zip: z.string().optional(),
});
export type BuyerContact = z.infer<typeof BuyerContact>;
