import type { PartType, SplicePolicy } from "../catalog/index";
import type { DimensionBindings } from "../catalog/jsonb";

/**
 * The generation engine's public types. The engine is pure: (Intake + a CatalogView)
 * → a resolved stair, SKU line-items, and advisory compliance warnings. No UI, no I/O.
 */

/** Spatial Intake inputs (ADR 0027). Rise + ceiling required; the rest optional. */
export type Intake = {
  totalRiseInch: number; // floor-to-floor (required)
  ceilingHeightInch: number; // required for headroom (ADR 0015/0030)
  runLengthInch?: number; // available total run; a Fit check, not a driver
  widthInch?: number; // default 42 (ADR 0027)
  stairwellOpeningLengthInch?: number; // default = full projected run (ADR 0015/0030)
  /** ±1 stepper on the derived Riser Count (ADR 0016). Absolute count, not a delta. */
  riserCount?: number;
  /** Per-tread going override; default is derived (ADR 0016). ≥10″ is advisory. */
  runInch?: number;
};

export type WarningCategory = "code" | "fit";
export type Warning = { code: string; category: WarningCategory; message: string };

/** A resolved SKU line for the cut list / PO (ADR 0014/0022). Cut dims are quantized. */
export type LineItem = {
  partType: PartType;
  skuCode: string;
  quantity: number;
  cutDimensionsInch: Record<string, number>;
  note?: string;
};

/** The engine's resolved stair. Geometry is exact-float; only the cut list quantizes (ADR 0022). */
export type ResolvedStair = {
  riserCount: number;
  riseInch: number; // exact nominal, read-only (ADR 0016)
  riserHeightsInch: number[]; // quantized + distributed to sum to the total (the cut list)
  treadCount: number;
  runInch: number; // per-tread going
  treadDepthInch: number; // = Run + nosing (ADR 0031)
  widthInch: number;
  totalRiseInch: number;
  totalRunInch: number;
  rakingFlightLengthInch: number;
  slope: number; // rise/run
  handrailHeightInch: number;
  handrailLengthInch: number;
  shoeRailLengthInch: number;
  balustersPerTread: number;
  balusterCount: number;
  balusterHeightInch: number; // nominal (tallest); balusters cut to size
  balusterClearSpacingInch: number; // clear gap at the chosen per-tread count
  newelCount: number;
  newelHeightInch: number;
  capCount: number;
  filletTotalLengthInch: number;
  openingLengthInch: number;
  headroomInch: number;
};

export type EngineResult = {
  stair: ResolvedStair;
  lineItems: LineItem[];
  warnings: Warning[];
};

/** Per-part catalog data the engine needs, resolved from the Company's catalog. */
export type ResolvedProduct = {
  partType: PartType;
  splicePolicy: SplicePolicy | null;
  dimensionBindings: DimensionBindings;
  defaultSku: {
    code: string;
    stockDimensionsInch: Record<string, number>;
  };
};

/** The slice of a Company's catalog the engine reads (ADR 0021 defaults drive it). */
export type CatalogView = {
  quantizeIncrementInch: number;
  products: ResolvedProduct[];
};
