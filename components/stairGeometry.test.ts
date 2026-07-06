import { describe, it, expect } from "vitest";
import { buildStairBoxes } from "./stairGeometry";
import { generate, toCatalogView } from "@/lib/engine";
import { catalog } from "@/supabase/seed/catalog";

const view = toCatalogView(catalog);
const { stair } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });

describe("buildStairBoxes", () => {
  const boxes = buildStairBoxes(stair);

  it("emits one box per finish part (risers + treads + 2 newels + rail + balusters)", () => {
    const expected = stair.riserCount + stair.treadCount + 2 + 1 + stair.balusterCount;
    expect(boxes).toHaveLength(expected);
  });

  it("has finite positions and strictly positive sizes everywhere (no NaN / inverted geometry)", () => {
    for (const b of boxes) {
      for (const p of b.pos) expect(Number.isFinite(p)).toBe(true);
      for (const s of b.size) {
        expect(Number.isFinite(s)).toBe(true);
        expect(s).toBeGreaterThan(0);
      }
    }
  });

  it("stacks risers so the top riser reaches the total rise", () => {
    const risers = boxes.filter((b) => b.key.startsWith("riser-"));
    const topRiserTop = Math.max(...risers.map((b) => b.pos[1] + b.size[1] / 2));
    expect(topRiserTop).toBeCloseTo(stair.totalRiseInch, 6);
  });

  it("degenerates gracefully for a single-step stair (no treads, no balusters)", () => {
    const tiny = generate(view, { totalRiseInch: 7, ceilingHeightInch: 96 }).stair;
    const b = buildStairBoxes(tiny);
    expect(tiny.riserCount).toBe(1);
    expect(b.every((x) => x.size.every((s) => s > 0))).toBe(true);
  });
});
