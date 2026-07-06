"use client";
import { useMemo } from "react";
import type { ResolvedStair } from "@/lib/engine";
import { buildStairBoxes } from "./stairGeometry";

/** Renders the procedural stair boxes (see stairGeometry.ts for the geometry math). */
export function StairModel({ stair }: { stair: ResolvedStair }) {
  const boxes = useMemo(() => buildStairBoxes(stair), [stair]);
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={b.key} position={b.pos} rotation={[0, 0, b.rotZ ?? 0]} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} roughness={0.62} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}
