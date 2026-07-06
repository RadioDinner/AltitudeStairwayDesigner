"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import type { ResolvedStair } from "@/lib/engine";
import { useReducedMotion } from "@/lib/ui/useReducedMotion";
import { StairModel } from "./StairModel";

/** Default export so it can be lazily loaded with `ssr: false` (three.js needs the DOM). */
export default function Scene3D({ stair }: { stair: ResolvedStair }) {
  const reduced = useReducedMotion();
  const { totalRunInch: tr, totalRiseInch: th, widthInch: w } = stair;
  const center: [number, number, number] = [tr / 2, th / 2 + 6, 0];
  const dist = Math.max(tr, th, w) * 1.7 + 90;
  const camPos: [number, number, number] = [center[0] + dist * 0.5, center[1] + dist * 0.42, dist * 0.95];

  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerspectiveCamera makeDefault position={camPos} fov={36} near={1} far={dist * 6} />
      <OrbitControls
        target={center}
        enablePan={false}
        minDistance={dist * 0.45}
        maxDistance={dist * 1.8}
        maxPolarAngle={Math.PI / 2 - 0.05}
        autoRotate={!reduced}
        autoRotateSpeed={0.5}
        enableDamping={!reduced}
      />

      {/* soft studio light — calm, no harsh specular (DESIGN.md: instrument, not toy) */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff6ea", "#3a4152", 0.55]} />
      <directionalLight position={[tr * 0.7 + 120, th + 220, w + 200]} intensity={1.7} />
      <directionalLight position={[-tr, th + 120, -w - 120]} intensity={0.35} />

      <StairModel stair={stair} />

      <ContactShadows
        position={[tr / 2, 0.2, 0]}
        scale={Math.max(tr, w) * 2.2}
        far={40}
        blur={2.6}
        opacity={0.32}
        color="#1a1712"
        resolution={1024}
      />
    </Canvas>
  );
}
