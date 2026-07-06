import { describe, it, expect } from "vitest";
import { quantize, distributeQuantized, spread, formatFeetInches, SIXTEENTH } from "./units";

describe("quantize", () => {
  it("rounds to the nearest 1/16", () => {
    expect(quantize(7.31666)).toBe(7.3125); // 7 5/16
    expect(quantize(7.34)).toBe(7.3125);
    expect(quantize(7.35)).toBe(7.375); // 7 6/16 = 7 3/8
    expect(quantize(0)).toBe(0);
  });
  it("respects a custom increment", () => {
    expect(quantize(1.1, 0.25)).toBe(1.0);
    expect(quantize(1.2, 0.25)).toBe(1.25);
  });
  it("throws on a non-positive increment", () => {
    expect(() => quantize(1, 0)).toThrow();
  });
});

describe("distributeQuantized", () => {
  it("sums exactly to the quantized total and varies by at most one step", () => {
    const parts = distributeQuantized(109.75, 15); // 9'1-3/4" over 15 risers
    expect(parts).toHaveLength(15);
    expect(parts.reduce((a, b) => a + b, 0)).toBeCloseTo(109.75, 10);
    expect(spread(parts)).toBeCloseTo(SIXTEENTH, 10); // exactly one 1/16 of variation
    expect(Math.max(...parts)).toBeCloseTo(7.375, 10);
    expect(Math.min(...parts)).toBeCloseTo(7.3125, 10);
  });
  it("is perfectly uniform when the total divides evenly on the grid", () => {
    const parts = distributeQuantized(105, 15); // 7.0 each, exactly
    expect(spread(parts)).toBe(0);
    expect(parts.every((p) => p === 7)).toBe(true);
  });
  it("throws on a non-positive count", () => {
    expect(() => distributeQuantized(100, 0)).toThrow();
  });
});

describe("formatFeetInches", () => {
  it("formats sixteenths and feet", () => {
    expect(formatFeetInches(7.3125)).toBe("7-5/16\"");
    expect(formatFeetInches(109.75)).toBe("9' 1-3/4\"");
    expect(formatFeetInches(7.9375)).toBe("7-15/16\"");
    expect(formatFeetInches(96)).toBe("8' 0\"");
    expect(formatFeetInches(11)).toBe("11\"");
  });
});
