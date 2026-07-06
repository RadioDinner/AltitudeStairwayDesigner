/**
 * Units — the exact-float core's only concession to the physical world (ADR 0022).
 * The engine carries dimensions as exact decimal-inch floats; these helpers quantize
 * to a manufacturing increment (default 1/16″) at the cut-list edge, and format for
 * display. Parsing feet-inches-fractions is a UI concern and lives elsewhere.
 */

export const SIXTEENTH = 1 / 16; // 0.0625, exactly representable in binary

/** Round to the nearest manufacturing increment. Works in integer steps to dodge fp drift. */
export function quantize(valueInch: number, incrInch: number = SIXTEENTH): number {
  if (incrInch <= 0) throw new Error("quantize increment must be > 0");
  return Math.round(valueInch / incrInch) * incrInch;
}

/**
 * Distribute a total across `count` equal parts on the increment grid so the parts
 * SUM EXACTLY to the quantized total and differ by at most one increment. This is
 * how a floor-to-floor rise becomes real cuttable risers: you cannot make every
 * riser identical AND sum to the total on a 1/16″ grid, so the remainder is spread
 * (ADR 0022). The rise-uniformity check then runs on this array, not the exact float.
 */
export function distributeQuantized(
  totalInch: number,
  count: number,
  incrInch: number = SIXTEENTH,
): number[] {
  if (count <= 0) throw new Error("count must be > 0");
  const totalSteps = Math.round(quantize(totalInch, incrInch) / incrInch);
  const base = Math.floor(totalSteps / count);
  const remainder = totalSteps - base * count; // 0..count-1 parts get one extra step
  const parts: number[] = [];
  for (let i = 0; i < count; i++) {
    parts.push((base + (i < remainder ? 1 : 0)) * incrInch);
  }
  return parts;
}

/** Largest − smallest, the input to the ⅜″ uniformity checks (ADR 0015). */
export function spread(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

/** Greatest common divisor for fraction reduction. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Format a value as feet-inches-sixteenths for display (e.g. 7.3125 → `7 5/16"`,
 * 109.75 → `9' 1-3/4"`). Display edge only — the engine never consumes this.
 */
export function formatFeetInches(valueInch: number, incrInch: number = SIXTEENTH): string {
  const q = quantize(valueInch, incrInch);
  const sign = q < 0 ? "-" : "";
  let rem = Math.abs(q);
  const feet = Math.floor(rem / 12);
  rem -= feet * 12;
  const wholeIn = Math.floor(rem);
  let frac = rem - wholeIn;
  const denom = Math.round(1 / incrInch);
  let numer = Math.round(frac * denom);
  let fracStr = "";
  if (numer === denom) {
    // rounded up to a whole inch
    return formatFeetInches((feet * 12 + wholeIn + 1) * (q < 0 ? -1 : 1), incrInch);
  }
  if (numer > 0) {
    const g = gcd(numer, denom);
    fracStr = `${numer / g}/${denom / g}`;
  }
  const inchPart =
    fracStr && wholeIn ? `${wholeIn}-${fracStr}` : fracStr ? fracStr : `${wholeIn}`;
  if (feet > 0) return `${sign}${feet}' ${inchPart}"`;
  return `${sign}${inchPart}"`;
}
