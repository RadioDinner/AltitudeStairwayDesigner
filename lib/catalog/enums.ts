import { z } from "zod";

/**
 * Value sets that mirror the Postgres enums in the init migration. Keep these in
 * lockstep with `supabase/migrations/*_init_catalog_schema.sql`.
 */

// The deliberately-small v1 part set (ADR 0008).
export const partTypes = [
  "tread",
  "riser",
  "baluster",
  "handrail",
  "newel",
  "shoe_rail",
  "fillet",
  "cap",
] as const;
export const PartType = z.enum(partTypes);
export type PartType = z.infer<typeof PartType>;

// How real stock satisfies a dimension binding (ADR 0010).
export const stockingRules = ["fixed", "stock_lengths", "cut_to_size"] as const;
export const StockingRule = z.enum(stockingRules);
export type StockingRule = z.infer<typeof StockingRule>;

// 'species' participates in Primary-Species coordination; 'finish' does not (ADR 0011/0012).
export const materialKinds = ["species", "finish"] as const;
export const MaterialKind = z.enum(materialKinds);
export type MaterialKind = z.infer<typeof MaterialKind>;

// Linear-part splice policy (ADR 0024).
export const splicePolicies = ["continuous", "spliceable"] as const;
export const SplicePolicy = z.enum(splicePolicies);
export type SplicePolicy = z.infer<typeof SplicePolicy>;

/**
 * rail_system is intentionally open text, NOT an enum (ADR 0028): `post_to_post`
 * ships in v1, and `over_the_post` is addable later as a second value without a
 * schema migration. Known values drive UI labels; unknown values are tolerated.
 */
export const knownRailSystems = ["post_to_post"] as const;
export const RailSystem = z.string().min(1);
export type RailSystem = z.infer<typeof RailSystem>;
