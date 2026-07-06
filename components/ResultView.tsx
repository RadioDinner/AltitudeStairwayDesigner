"use client";
import dynamic from "next/dynamic";
import type { ResolvedStair, Warning } from "@/lib/engine";
import { ReadoutPanel } from "./ReadoutPanel";
import { WarningsList } from "./WarningsList";
import styles from "./ResultView.module.css";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className={styles.sceneSkeleton} aria-hidden="true" />,
});

type Props = {
  stair: ResolvedStair;
  warnings: Warning[];
  suggestedRiserCount: number;
  onRiserCountChange: (next: number) => void;
  onResetRiserCount: () => void;
  onEdit: () => void;
};

export function ResultView({ stair, warnings, suggestedRiserCount, onRiserCountChange, onResetRiserCount, onEdit }: Props) {
  return (
    <div className={styles.layout}>
      <div className={styles.viewport}>
        <Scene3D stair={stair} />
        <button type="button" className={styles.back} onClick={onEdit}>
          <ArrowLeft />
          Edit measurements
        </button>
        <p className={styles.hint} aria-hidden="true">
          Drag to rotate · scroll to zoom
        </p>
      </div>

      <aside className={styles.panel} aria-label="Staircase details">
        <header className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Your staircase</h2>
          <p className={styles.panelSub}>
            {stair.riserCount} steps · rises {fmtCount(stair)} to the next floor
          </p>
        </header>

        <ReadoutPanel
          stair={stair}
          suggestedRiserCount={suggestedRiserCount}
          onRiserCountChange={onRiserCountChange}
          onResetRiserCount={onResetRiserCount}
        />

        <WarningsList warnings={warnings} />

        <footer className={styles.next}>
          <button type="button" className={styles.rfq} disabled>
            Request a quote
          </button>
          <p className={styles.nextNote}>The quote request is the next step we're building.</p>
        </footer>
      </aside>
    </div>
  );
}

function fmtCount(stair: ResolvedStair): string {
  const feet = Math.round((stair.totalRiseInch / 12) * 10) / 10;
  return `${feet} ft`;
}

function ArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
