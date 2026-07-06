import type { ResolvedStair } from "@/lib/engine";

/**
 * Pure procedural geometry for the 3D stair — honest boxy finish parts only
 * (ADR 0001/0004): treads, risers, two newel posts, a raking handrail, plain square
 * balusters. No ornamental GLTF (assets pending). Units are inches. Kept free of R3F
 * so the geometry math is unit-testable without a browser.
 */

export const TREAD_THICKNESS = 1;
export const RISER_THICKNESS = 0.75;
export const NEWEL_SECTION = 3.5;
export const BALUSTER_SECTION = 0.9;
export const RAIL_W = 2.5;
export const RAIL_D = 1.75;

export const OAK = "#b98d5b";
export const OAK_RISER = "#a97f50";
export const OAK_RAIL = "#b07f4f";

export type Box = {
  key: string;
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  rotZ?: number;
};

export function buildStairBoxes(stair: ResolvedStair): Box[] {
  const { riserCount, treadCount, riseInch: rise, runInch: run, treadDepthInch: treadDepth, widthInch: width } = stair;
  const nosing = treadDepth - run;
  const totalRun = stair.totalRunInch;
  const totalRise = stair.totalRiseInch;
  const railHeight = stair.handrailHeightInch;
  const zRail = width / 2 - NEWEL_SECTION / 2; // open side
  const slope = totalRun > 0 ? totalRise / totalRun : 0;
  const railY = (x: number): number => slope * x + railHeight;

  const boxes: Box[] = [];

  for (let i = 0; i < riserCount; i++) {
    boxes.push({
      key: `riser-${i}`,
      pos: [i * run + RISER_THICKNESS / 2, i * rise + rise / 2, 0],
      size: [RISER_THICKNESS, rise, width],
      color: OAK_RISER,
    });
  }

  for (let i = 0; i < treadCount; i++) {
    const stepTop = (i + 1) * rise;
    const cx = i * run - nosing + treadDepth / 2;
    boxes.push({
      key: `tread-${i}`,
      pos: [cx, stepTop - TREAD_THICKNESS / 2, 0],
      size: [treadDepth, TREAD_THICKNESS, width],
      color: OAK,
    });
  }

  boxes.push({
    key: "newel-bottom",
    pos: [0, stair.newelHeightInch / 2, zRail],
    size: [NEWEL_SECTION, stair.newelHeightInch, NEWEL_SECTION],
    color: OAK_RAIL,
  });
  boxes.push({
    key: "newel-top",
    pos: [totalRun, totalRise + stair.newelHeightInch / 2, zRail],
    size: [NEWEL_SECTION, stair.newelHeightInch, NEWEL_SECTION],
    color: OAK_RAIL,
  });

  const railLen = Math.hypot(totalRun, totalRise);
  boxes.push({
    key: "handrail",
    pos: [totalRun / 2, totalRise / 2 + railHeight, zRail],
    size: [railLen, RAIL_W, RAIL_D],
    color: OAK_RAIL,
    rotZ: Math.atan2(totalRise, totalRun),
  });

  for (let i = 0; i < treadCount; i++) {
    const stepTop = (i + 1) * rise;
    for (let k = 0; k < stair.balustersPerTread; k++) {
      const frac = (k + 0.5) / stair.balustersPerTread;
      const xBal = i * run + frac * run;
      const h = Math.max(2, railY(xBal) - stepTop);
      boxes.push({
        key: `baluster-${i}-${k}`,
        pos: [xBal, stepTop + h / 2, zRail],
        size: [BALUSTER_SECTION, h, BALUSTER_SECTION],
        color: OAK,
      });
    }
  }

  return boxes;
}
