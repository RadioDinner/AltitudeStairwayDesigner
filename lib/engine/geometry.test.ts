import { describe, it, expect } from "vitest";
import { computeStair, type EngineConfig } from "./geometry";
import { IRC } from "./rules";

const cfg: EngineConfig = {
  quantizeIncrementInch: 1 / 16,
  nosingInch: 1,
  defaultRunInch: 11,
  defaultHandrailHeightInch: 36,
  maxHandrailStockInch: 192,
  balusterSectionInch: 1.25,
  maxBalustersPerTread: 3,
};

describe("computeStair — riser count & rise (ADR 0016)", () => {
  it("seeds riser count with ceil so the seed is never over max rise", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109 }, cfg);
    expect(s.riserCount).toBe(15); // ceil(109.75 / 7.75) = ceil(14.16)
    expect(s.riseInch).toBeCloseTo(7.31667, 4);
    expect(Math.max(...s.riserHeightsInch)).toBeLessThanOrEqual(IRC.maxRiseInch);
    expect(s.riserHeightsInch.reduce((a, b) => a + b, 0)).toBeCloseTo(109.75, 8);
  });

  it("ceil holds across a range of rises (never seeds over max)", () => {
    for (let total = 80; total <= 130; total += 0.25) {
      const s = computeStair({ totalRiseInch: total, ceilingHeightInch: 108 }, cfg);
      expect(s.riseInch).toBeLessThanOrEqual(IRC.maxRiseInch + 1e-9);
    }
  });

  it("honors a riser-count override (the ±1 stepper)", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109, riserCount: 14 }, cfg);
    expect(s.riserCount).toBe(14);
    expect(s.riseInch).toBeCloseTo(7.8393, 3); // over max — a deliberate override
    expect(Math.max(...s.riserHeightsInch)).toBeGreaterThan(IRC.maxRiseInch);
  });
});

describe("computeStair — run, tread depth, footprint", () => {
  it("tread depth = Run + nosing (ADR 0031) and tread count = risers − 1", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109 }, cfg);
    expect(s.runInch).toBe(11);
    expect(s.treadDepthInch).toBe(12); // 11 + 1 nosing
    expect(s.treadCount).toBe(14);
    expect(s.totalRunInch).toBe(154); // 14 * 11
    expect(s.rakingFlightLengthInch).toBeCloseTo(Math.hypot(154, 109.75), 6);
  });
});

describe("computeStair — balusters (ADR 0023)", () => {
  it("stays at 2 per tread when the 4-inch sphere is satisfied", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109 }, cfg);
    expect(s.balustersPerTread).toBe(2);
    expect(s.balusterClearSpacingInch).toBeLessThanOrEqual(IRC.sphereInch);
    expect(s.balusterCount).toBe(28); // 2 * 14
  });

  it("bumps to 3 per tread only when a wider going lets the sphere pass", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109, runInch: 16 }, cfg);
    expect(s.balustersPerTread).toBe(3); // (16 - 2*1.25)/3 = 4.5 > 4 → bump
    expect(s.balusterClearSpacingInch).toBeLessThanOrEqual(IRC.sphereInch);
  });
});

describe("computeStair — headroom (ADR 0015/0030)", () => {
  it("defaults the opening to the full projected run (most forgiving case)", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 109 }, cfg);
    expect(s.openingLengthInch).toBe(s.totalRunInch);
    // with a full opening, slope*opening = totalRise, so headroom = ceiling height
    expect(s.headroomInch).toBeCloseTo(109, 6);
  });

  it("a short opening lowers headroom", () => {
    const s = computeStair({ totalRiseInch: 109.75, ceilingHeightInch: 80, stairwellOpeningLengthInch: 10 }, cfg);
    expect(s.headroomInch).toBeLessThan(IRC.minHeadroomInch);
  });
});
