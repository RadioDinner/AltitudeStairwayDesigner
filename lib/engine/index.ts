/**
 * The generation engine (build-path step 3). Pure: (Intake + CatalogView) → resolved
 * stair + SKU line-items + advisory compliance warnings. No UI, no I/O. Honors the
 * units model (ADR 0022), ceil seed (0016), per-tread balusters (0023), tread depth =
 * Run + nosing (0031), and the advisory-only IRC ruleset (0015/0003).
 */
import type { CatalogView, EngineResult, Intake, ResolvedProduct } from "./types";
import { computeStair, DEFAULTS, type EngineConfig } from "./geometry";
import { checkCompliance } from "./rules";
import { resolveLineItems } from "./lineItems";
import { DimensionBindings } from "../catalog/jsonb";

export * from "./types";
export { computeStair, DEFAULTS } from "./geometry";
export { IRC, checkCompliance } from "./rules";
export { resolveLineItems, sticksNeeded } from "./lineItems";
export { quantize, distributeQuantized, spread, formatFeetInches, SIXTEENTH } from "./units";

function fixedBindingInch(p: ResolvedProduct | undefined, dim: string): number | undefined {
  const b = p?.dimensionBindings[dim];
  return b?.source.kind === "fixed" ? b.source.valueInch : undefined;
}

/** Extract the engine's config constants from a Company's catalog (+ fixed defaults). */
export function configFromCatalog(view: CatalogView): EngineConfig {
  const byType = new Map(view.products.map((p) => [p.partType, p]));
  const tread = byType.get("tread");
  const handrail = byType.get("handrail");
  const baluster = byType.get("baluster");

  const nosingInch =
    fixedBindingInch(tread, "nosing") ?? tread?.defaultSku.stockDimensionsInch["nosingInch"] ?? 1.0;
  const maxHandrailStockInch = handrail?.dimensionBindings["length"]?.maxInch ?? 192;
  const balusterSectionInch = baluster?.defaultSku.stockDimensionsInch["sectionInch"] ?? 1.25;

  return {
    quantizeIncrementInch: view.quantizeIncrementInch,
    nosingInch,
    defaultRunInch: DEFAULTS.runInch,
    defaultHandrailHeightInch: DEFAULTS.handrailHeightInch,
    maxHandrailStockInch,
    balusterSectionInch,
    maxBalustersPerTread: DEFAULTS.maxBalustersPerTread,
  };
}

/** Run the full pipeline: derive the stair, check compliance, resolve the cut list. */
export function generate(view: CatalogView, intake: Intake): EngineResult {
  const config = configFromCatalog(view);
  const stair = computeStair(intake, config);
  const warnings = checkCompliance(stair, {
    maxHandrailStockInch: config.maxHandrailStockInch,
    availableRunLengthInch: intake.runLengthInch,
  });
  const lineItems = resolveLineItems(stair, view);
  return { stair, lineItems, warnings };
}

/**
 * Adapter: build a CatalogView from the seed-shaped catalog (or an equivalent DB
 * query result). Structurally typed so the engine stays decoupled from the DB layer;
 * the app's PO pipeline will build the same view from Supabase rows later.
 */
export type SeedShapedCatalog = {
  company: { quantize_increment_inch: number };
  products: Array<{
    part_type: string;
    splice_policy: string | null;
    dimension_bindings: unknown;
    default_sku_id: string;
    skus: Array<{ id: string; code: string; stock_dimensions: Record<string, number> }>;
  }>;
};

export function toCatalogView(catalog: SeedShapedCatalog): CatalogView {
  const products: ResolvedProduct[] = catalog.products.map((p) => {
    const defaultSku = p.skus.find((s) => s.id === p.default_sku_id);
    if (!defaultSku) throw new Error(`product ${p.part_type}: default_sku_id does not resolve`);
    return {
      partType: p.part_type as ResolvedProduct["partType"],
      splicePolicy: (p.splice_policy as ResolvedProduct["splicePolicy"]) ?? null,
      dimensionBindings: DimensionBindings.parse(p.dimension_bindings),
      defaultSku: { code: defaultSku.code, stockDimensionsInch: defaultSku.stock_dimensions },
    };
  });
  return { quantizeIncrementInch: catalog.company.quantize_increment_inch, products };
}
