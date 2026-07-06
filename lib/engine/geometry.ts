import type { Intake, ResolvedStair } from "./types";
import { IRC } from "./rules";
import { distributeQuantized } from "./units";

/** Engine constants not carried in the catalog. Seams for later per-shop config. */
export const DEFAULTS = {
  runInch: 11, // derived per-tread going (ADR 0016 step 2); ≥ min run 10″ with margin
  handrailHeightInch: 36, // within IRC 34–38 (ADR 0015)
  widthInch: 42, // Intake width default (ADR 0027)
  balustersPerTreadBase: 2, // per-tread default (ADR 0023)
  maxBalustersPerTread: 3, // bump ceiling (ADR 0023)
  newelTopAboveRailInch: 3, // newel extends above the rail by a cap allowance
} as const;

/** Constants the engine reads from the Company's catalog, plus the fixed defaults above. */
export type EngineConfig = {
  quantizeIncrementInch: number;
  nosingInch: number; // per-profile tread nosing (ADR 0031)
  defaultRunInch: number;
  defaultHandrailHeightInch: number;
  maxHandrailStockInch: number; // longest continuous handrail stock (ADR 0024)
  balusterSectionInch: number; // default baluster cross-section, for spacing (ADR 0023)
  maxBalustersPerTread: number;
};

const clearGap = (runInch: number, perTread: number, sectionInch: number): number =>
  (runInch - perTread * sectionInch) / (perTread + 1);

/**
 * Derive the full stair from Intake (ADR 0016/0031/0023/0015). Geometry is exact
 * float; only `riserHeightsInch` is quantized — that is the real cut list (ADR 0022).
 */
export function computeStair(intake: Intake, config: EngineConfig): ResolvedStair {
  const totalRiseInch = intake.totalRiseInch;

  // 1. Riser count = ceil(totalRise / maxRise) so the seed is never over max rise;
  //    stepping down is a deliberate override (ADR 0016). Then Rise = total / count.
  const derivedCount = Math.max(1, Math.ceil(totalRiseInch / IRC.maxRiseInch));
  const riserCount = Math.max(1, intake.riserCount ?? derivedCount);
  const riseInch = totalRiseInch / riserCount; // exact, read-only
  const riserHeightsInch = distributeQuantized(totalRiseInch, riserCount, config.quantizeIncrementInch);

  // 2. Run (per-tread going), tread count, footprint, and tread depth = Run + nosing.
  const treadCount = Math.max(0, riserCount - 1);
  const runInch = intake.runInch ?? config.defaultRunInch;
  const treadDepthInch = runInch + config.nosingInch; // ADR 0031
  const totalRunInch = treadCount * runInch;
  const widthInch = intake.widthInch ?? DEFAULTS.widthInch;
  const rakingFlightLengthInch = Math.hypot(totalRunInch, totalRiseInch);
  const slope = totalRunInch > 0 ? totalRiseInch / totalRunInch : Infinity;

  // 3. Balusters: per-tread, 2 by default, bumped toward the cap only while the 4″
  //    sphere passes (ADR 0023). Horizontal clear spacing approximates the raking rule.
  let balustersPerTread = DEFAULTS.balustersPerTreadBase;
  let balusterClearSpacingInch = clearGap(runInch, balustersPerTread, config.balusterSectionInch);
  while (balusterClearSpacingInch > IRC.sphereInch && balustersPerTread < config.maxBalustersPerTread) {
    balustersPerTread += 1;
    balusterClearSpacingInch = clearGap(runInch, balustersPerTread, config.balusterSectionInch);
  }
  const balusterCount = balustersPerTread * treadCount;

  // 4. Rail, shoe, newels, caps, fillets.
  const handrailHeightInch = config.defaultHandrailHeightInch;
  const handrailLengthInch = rakingFlightLengthInch; // continuous, parallel to the rake (ADR 0024)
  const shoeRailLengthInch = rakingFlightLengthInch;
  // nominal baluster height (tallest, back-of-tread); balusters are cut to size.
  const balusterHeightInch = handrailHeightInch + riseInch;
  const newelCount = 2; // starting + landing newel (post-to-post, ADR 0028)
  const newelHeightInch = handrailHeightInch + DEFAULTS.newelTopAboveRailInch;
  const capCount = newelCount; // one cap per newel (ADR 0028)
  // fillets fill the plow of both the handrail and the shoe rail, between balusters.
  const filletTotalLengthInch =
    Math.max(0, handrailLengthInch - balusterCount * config.balusterSectionInch) +
    Math.max(0, shoeRailLengthInch - balusterCount * config.balusterSectionInch);

  // 5. Headroom at the opening's near edge; opening defaults to the full projected
  //    run (the most forgiving "open above the whole flight" case) (ADR 0015/0030).
  const openingLengthInch = intake.stairwellOpeningLengthInch ?? totalRunInch;
  const slopeContribution = totalRunInch > 0 ? slope * openingLengthInch : 0;
  const headroomInch = intake.ceilingHeightInch - totalRiseInch + slopeContribution;

  return {
    riserCount,
    riseInch,
    riserHeightsInch,
    treadCount,
    runInch,
    treadDepthInch,
    widthInch,
    totalRiseInch,
    totalRunInch,
    rakingFlightLengthInch,
    slope,
    handrailHeightInch,
    handrailLengthInch,
    shoeRailLengthInch,
    balustersPerTread,
    balusterCount,
    balusterHeightInch,
    balusterClearSpacingInch,
    newelCount,
    newelHeightInch,
    capCount,
    filletTotalLengthInch,
    openingLengthInch,
    headroomInch,
  };
}
