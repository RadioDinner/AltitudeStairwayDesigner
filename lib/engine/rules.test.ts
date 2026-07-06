import { describe, it, expect } from "vitest";
import { checkCompliance, IRC } from "./rules";
import type { ResolvedStair } from "./types";

// A fully compliant baseline stair; each test overrides one field to trip one rule.
function baseStair(over: Partial<ResolvedStair> = {}): ResolvedStair {
  return {
    riserCount: 15,
    riseInch: 7.3167,
    riserHeightsInch: Array(15).fill(7.3125),
    treadCount: 14,
    runInch: 11,
    treadDepthInch: 12,
    widthInch: 42,
    totalRiseInch: 109.75,
    totalRunInch: 154,
    rakingFlightLengthInch: 189,
    slope: 0.7126,
    handrailHeightInch: 36,
    handrailLengthInch: 180,
    shoeRailLengthInch: 180,
    balustersPerTread: 2,
    balusterCount: 28,
    balusterHeightInch: 43,
    balusterClearSpacingInch: 2.83,
    newelCount: 2,
    newelHeightInch: 39,
    capCount: 2,
    filletTotalLengthInch: 300,
    openingLengthInch: 154,
    headroomInch: 100,
    ...over,
  };
}

const codes = (stair: ResolvedStair, opts?: { maxHandrailStockInch?: number; availableRunLengthInch?: number }) =>
  checkCompliance(stair, { maxHandrailStockInch: opts?.maxHandrailStockInch ?? 192, availableRunLengthInch: opts?.availableRunLengthInch }).map((w) => w.code);

describe("checkCompliance (ADR 0015, all advisory)", () => {
  it("a compliant stair yields no warnings", () => {
    expect(checkCompliance(baseStair(), { maxHandrailStockInch: 192 })).toEqual([]);
  });

  it("flags max rise on the tallest cut riser", () => {
    const risers = Array(14).fill(7.8125);
    risers[0] = 7.875;
    expect(codes(baseStair({ riserHeightsInch: risers }))).toContain("max_rise");
  });

  it("flags rise non-uniformity over 3/8 inch", () => {
    expect(codes(baseStair({ riserHeightsInch: [7.0, 7.5, 7.0, 7.25] }))).toContain("rise_uniformity");
  });

  it("flags a sub-10-inch run", () => {
    expect(codes(baseStair({ runInch: 9 }))).toContain("min_run");
  });

  it("flags insufficient headroom", () => {
    expect(codes(baseStair({ headroomInch: 70 }))).toContain("headroom");
  });

  it("flags a narrow stair", () => {
    expect(codes(baseStair({ widthInch: 30 }))).toContain("min_width");
  });

  it("flags a handrail height outside 34–38", () => {
    expect(codes(baseStair({ handrailHeightInch: 40 }))).toContain("handrail_height");
    expect(codes(baseStair({ handrailHeightInch: 33 }))).toContain("handrail_height");
  });

  it("flags baluster spacing that passes a 4-inch sphere", () => {
    expect(codes(baseStair({ balusterClearSpacingInch: 5 }))).toContain("baluster_spacing");
  });

  it("flags a continuous handrail longer than stock (Fit)", () => {
    const ws = checkCompliance(baseStair({ handrailLengthInch: 200 }), { maxHandrailStockInch: 192 });
    expect(ws.find((w) => w.code === "handrail_too_long")?.category).toBe("fit");
  });

  it("flags a footprint that exceeds the available run (Fit)", () => {
    const ws = checkCompliance(baseStair({ totalRunInch: 154 }), { maxHandrailStockInch: 192, availableRunLengthInch: 100 });
    expect(ws.find((w) => w.code === "fit_run_length")?.category).toBe("fit");
  });

  it("does not fire the fit-run check when no available run is given", () => {
    expect(codes(baseStair())).not.toContain("fit_run_length");
    expect(IRC.maxRiseInch).toBe(7.75);
  });
});
