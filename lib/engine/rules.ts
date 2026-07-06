import type { ResolvedStair, Warning } from "./types";
import { spread } from "./units";

/**
 * The v1 residential IRC dimensional ruleset (ADR 0015, IRC R311.7). Every check is
 * an Advisory Override — flagged, never blocking (ADR 0003/0019/0026). Nosing is met
 * by catalog invariant, so there is deliberately NO runtime nosing check (ADR 0031).
 */
export const IRC = {
  maxRiseInch: 7.75, // 7¾″
  minRunInch: 10,
  minHeadroomInch: 80, // 6′8″
  minWidthInch: 36,
  handrailMinInch: 34,
  handrailMaxInch: 38,
  sphereInch: 4, // 4″-sphere baluster spacing
  uniformityToleranceInch: 0.375, // ⅜″
} as const;

const code = (c: string, message: string): Warning => ({ code: c, category: "code", message });
const fit = (c: string, message: string): Warning => ({ code: c, category: "fit", message });

/**
 * Run the advisory checks against a resolved stair. Dimensional checks (max rise,
 * uniformity) run on the QUANTIZED cut dimensions, not the exact floats (ADR 0022) —
 * that is the staircase that actually gets built.
 */
export function checkCompliance(
  stair: ResolvedStair,
  opts: { maxHandrailStockInch: number; availableRunLengthInch?: number },
): Warning[] {
  const w: Warning[] = [];
  const risers = stair.riserHeightsInch;
  const maxRiser = risers.length ? Math.max(...risers) : 0;

  // 1. Max Rise — checked on the tallest cut riser.
  if (maxRiser > IRC.maxRiseInch) {
    w.push(code("max_rise", `Tallest riser ${maxRiser.toFixed(3)}″ exceeds the ${IRC.maxRiseInch}″ max.`));
  }
  // 3. Rise uniformity — largest − smallest cut riser ≤ ⅜″.
  if (spread(risers) > IRC.uniformityToleranceInch) {
    w.push(code("rise_uniformity", `Riser heights vary by ${spread(risers).toFixed(3)}″, over the ${IRC.uniformityToleranceInch}″ limit.`));
  }
  // 2. Min Run.
  if (stair.runInch < IRC.minRunInch) {
    w.push(code("min_run", `Run ${stair.runInch.toFixed(3)}″ is below the ${IRC.minRunInch}″ minimum.`));
  }
  // 4. Run uniformity — v1 uses a single Run, so this is trivially satisfied, but the
  // check is here for when per-tread run adjustment lands.
  // (single-value run array → spread 0)

  // 5. Min headroom — measured at the opening's near edge, assumes a flush header (ADR 0030).
  if (stair.headroomInch < IRC.minHeadroomInch) {
    w.push(code("headroom", `Headroom ${stair.headroomInch.toFixed(1)}″ is under the ${IRC.minHeadroomInch}″ (6′8″) minimum (assumes a flush header).`));
  }
  // 6. Min width.
  if (stair.widthInch < IRC.minWidthInch) {
    w.push(code("min_width", `Width ${stair.widthInch}″ is below the ${IRC.minWidthInch}″ minimum.`));
  }
  // 7. Handrail height — 34″–38″ above the nosing line.
  if (stair.handrailHeightInch < IRC.handrailMinInch || stair.handrailHeightInch > IRC.handrailMaxInch) {
    w.push(code("handrail_height", `Handrail height ${stair.handrailHeightInch}″ is outside ${IRC.handrailMinInch}″–${IRC.handrailMaxInch}″.`));
  }
  // 8. Baluster spacing — 4″-sphere rule (raking). Warns only if still failing at the
  // max per-tread count (ADR 0023).
  if (stair.balusterClearSpacingInch > IRC.sphereInch) {
    w.push(code("baluster_spacing", `Baluster clear spacing ${stair.balusterClearSpacingInch.toFixed(2)}″ lets a ${IRC.sphereInch}″ sphere pass.`));
  }

  // Fit checks (not IRC): the continuous handrail exceeds the longest stock (ADR 0024).
  if (stair.handrailLengthInch > opts.maxHandrailStockInch) {
    w.push(fit("handrail_too_long", `Continuous handrail ${stair.handrailLengthInch.toFixed(1)}″ exceeds the ${opts.maxHandrailStockInch}″ longest stock length.`));
  }
  // Fit: the stair's footprint exceeds the available run length (ADR 0019).
  if (opts.availableRunLengthInch != null && stair.totalRunInch > opts.availableRunLengthInch) {
    w.push(fit("fit_run_length", `Total run ${stair.totalRunInch.toFixed(1)}″ exceeds the available ${opts.availableRunLengthInch}″.`));
  }
  return w;
}
