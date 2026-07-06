import type { CatalogView, LineItem, ResolvedProduct, ResolvedStair } from "./types";
import type { PartType } from "../catalog/index";
import { quantize } from "./units";

/** Fewest sticks of `stockLengths` to cover `length` (spliceable parts, ADR 0024). */
export function sticksNeeded(lengthInch: number, stockLengths: number[]): { count: number; stockLengthInch: number } {
  const sorted = [...stockLengths].sort((a, b) => b - a);
  const max = sorted[0] ?? 0;
  if (lengthInch <= 0 || max <= 0) return { count: 0, stockLengthInch: max };
  // If one stick from the smallest sufficient stock covers it, use that; else tile the longest.
  const single = sorted.filter((s) => s >= lengthInch).sort((a, b) => a - b)[0];
  if (single != null) return { count: 1, stockLengthInch: single };
  return { count: Math.ceil(lengthInch / max), stockLengthInch: max };
}

function stockLengthsOf(p: ResolvedProduct): number[] {
  const b = p.dimensionBindings["length"];
  return b?.stockLengthsInch ?? [];
}

/**
 * Resolve the SKU line-items (cut list) for a stair from the catalog's default
 * selection (ADR 0021). Cut dimensions quantize to the shop increment (ADR 0022).
 * Risers are grouped by cut height so the PO shows the real (near-uniform) spread.
 */
export function resolveLineItems(stair: ResolvedStair, view: CatalogView): LineItem[] {
  const incr = view.quantizeIncrementInch;
  const q = (v: number): number => quantize(v, incr);
  const byType = new Map<PartType, ResolvedProduct>();
  for (const p of view.products) byType.set(p.partType, p);
  const items: LineItem[] = [];

  const push = (p: ResolvedProduct, quantity: number, cut: Record<string, number>, note?: string): void => {
    if (quantity <= 0) return;
    items.push({ partType: p.partType, skuCode: p.defaultSku.code, quantity, cutDimensionsInch: cut, note });
  };

  const tread = byType.get("tread");
  if (tread) {
    push(tread, stair.treadCount, {
      depthInch: q(stair.treadDepthInch),
      lengthInch: q(stair.widthInch),
      thicknessInch: tread.defaultSku.stockDimensionsInch["thicknessInch"] ?? 0,
    });
  }

  const riser = byType.get("riser");
  if (riser) {
    // group identical cut heights (ADR 0022: near-uniform, a couple of distinct heights)
    const groups = new Map<number, number>();
    for (const h of stair.riserHeightsInch) groups.set(h, (groups.get(h) ?? 0) + 1);
    for (const [height, count] of [...groups.entries()].sort((a, b) => b[0] - a[0])) {
      push(riser, count, {
        heightInch: height,
        lengthInch: q(stair.widthInch),
        thicknessInch: riser.defaultSku.stockDimensionsInch["thicknessInch"] ?? 0,
      });
    }
  }

  const baluster = byType.get("baluster");
  if (baluster) {
    push(baluster, stair.balusterCount, {
      heightInch: q(stair.balusterHeightInch),
      sectionInch: baluster.defaultSku.stockDimensionsInch["sectionInch"] ?? 0,
    }, `${stair.balustersPerTread} per tread; cut to size`);
  }

  const handrail = byType.get("handrail");
  if (handrail) {
    push(handrail, 1, { lengthInch: q(stair.handrailLengthInch) }, "continuous single length");
  }

  const newel = byType.get("newel");
  if (newel) {
    push(newel, stair.newelCount, {
      heightInch: q(stair.newelHeightInch),
      sectionInch: newel.defaultSku.stockDimensionsInch["sectionInch"] ?? 0,
    });
  }

  const shoe = byType.get("shoe_rail");
  if (shoe) {
    const s = sticksNeeded(stair.shoeRailLengthInch, stockLengthsOf(shoe));
    push(shoe, s.count, { lengthInch: q(s.stockLengthInch) }, "spliceable; cut to length");
  }

  const fillet = byType.get("fillet");
  if (fillet) {
    const s = sticksNeeded(stair.filletTotalLengthInch, stockLengthsOf(fillet));
    push(fillet, s.count, { lengthInch: q(s.stockLengthInch) }, "fills the rail plow between balusters");
  }

  const cap = byType.get("cap");
  if (cap) {
    const sd = cap.defaultSku.stockDimensionsInch;
    push(cap, stair.capCount, {
      lengthInch: sd["lengthInch"] ?? 0,
      widthInch: sd["widthInch"] ?? 0,
      thicknessInch: sd["thicknessInch"] ?? 0,
    });
  }

  return items;
}
