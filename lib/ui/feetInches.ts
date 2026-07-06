/**
 * Parse feet-inches-fractions text into exact decimal inches — the UI edge of the
 * units model (ADR 0022). The engine never sees a fraction; fields convert here.
 * Accepts: `9' 1-3/4"`, `9'1 3/4`, `109.75`, `42`, `36"`, `3/4"`, `9 ft 1 in`.
 * Returns null when nothing parseable is present (empty or garbage).
 */
export function parseFeetInches(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  let inches = 0;
  let matched = false;

  // feet: a number immediately followed by ' / ft / feet
  const feet = s.match(/(\d+(?:\.\d+)?)\s*(?:'|ft\b|feet\b)/);
  if (feet?.[1]) {
    inches += parseFloat(feet[1]) * 12;
    matched = true;
  }

  // inches remainder (drop the feet portion and any inch marks)
  let rest = (feet ? s.slice((feet.index ?? 0) + feet[0].length) : s)
    .replace(/["″]|in\b|inch(?:es)?\b/g, " ")
    .trim();

  if (rest) {
    const mixed = rest.match(/^(\d+(?:\.\d+)?)[\s-]+(\d+)\s*\/\s*(\d+)/); // 1-3/4
    const frac = rest.match(/^(\d+)\s*\/\s*(\d+)/); // 3/4
    const dec = rest.match(/^(\d+(?:\.\d+)?)/); // 1 or 1.75
    if (mixed?.[1] && mixed[2] && mixed[3]) {
      inches += parseFloat(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
      matched = true;
    } else if (frac?.[1] && frac[2]) {
      inches += Number(frac[1]) / Number(frac[2]);
      matched = true;
    } else if (dec?.[1]) {
      inches += parseFloat(dec[1]);
      matched = true;
    }
  }

  return matched ? inches : null;
}
