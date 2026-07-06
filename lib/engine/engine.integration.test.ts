import { describe, it, expect } from "vitest";
import { generate, toCatalogView } from "./index";
import { catalog } from "../../supabase/seed/catalog";
import { partTypes } from "../catalog/enums";

// Drives the real generation engine against the real placeholder catalog (step 2),
// proving the two fit together end to end.
const view = toCatalogView(catalog);

describe("generate() against the seeded catalog", () => {
  it("produces a compliant stair with no warnings for a typical space", () => {
    const { stair, warnings, lineItems } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });
    expect(stair.riserCount).toBe(15);
    expect(warnings).toEqual([]);
    expect(lineItems.length).toBeGreaterThan(0);
  });

  it("emits a line item for every part type in the v1 set", () => {
    const { lineItems } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });
    const present = new Set(lineItems.map((li) => li.partType));
    for (const pt of partTypes) expect(present.has(pt)).toBe(true);
  });

  it("has sane quantities that tie back to the geometry", () => {
    const { stair, lineItems } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });
    const qty = (pt: string) => lineItems.filter((li) => li.partType === pt).reduce((a, li) => a + li.quantity, 0);
    expect(qty("tread")).toBe(stair.treadCount); // 14
    expect(qty("riser")).toBe(stair.riserCount); // 15 (may be split across two cut heights)
    expect(qty("baluster")).toBe(stair.balusterCount); // 28
    expect(qty("handrail")).toBe(1); // continuous
    expect(qty("newel")).toBe(2);
    expect(qty("cap")).toBe(2);
    expect(qty("shoe_rail")).toBeGreaterThanOrEqual(1);
    expect(qty("fillet")).toBeGreaterThanOrEqual(1);
  });

  it("quantizes every cut dimension to the shop increment (1/16 in.)", () => {
    const { lineItems } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });
    for (const li of lineItems) {
      for (const v of Object.values(li.cutDimensionsInch)) {
        expect(Math.abs(v * 16 - Math.round(v * 16))).toBeLessThan(1e-9);
      }
    }
  });

  it("names the default SKUs from the catalog on each line", () => {
    const { lineItems } = generate(view, { totalRiseInch: 109.75, ceilingHeightInch: 109 });
    const tread = lineItems.find((li) => li.partType === "tread");
    expect(tread?.skuCode).toBe("TRD-BN-RO"); // Red Oak default (ADR 0021)
  });

  it("surfaces an advisory headroom warning when the header is low", () => {
    const { warnings } = generate(view, {
      totalRiseInch: 109.75,
      ceilingHeightInch: 80,
      stairwellOpeningLengthInch: 10,
    });
    expect(warnings.some((w) => w.code === "headroom" && w.category === "code")).toBe(true);
  });
});
