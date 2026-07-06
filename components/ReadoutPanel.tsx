"use client";
import type { ResolvedStair } from "@/lib/engine";
import { formatFeetInches } from "@/lib/engine";
import styles from "./ReadoutPanel.module.css";

type Props = {
  stair: ResolvedStair;
  suggestedRiserCount: number;
  onRiserCountChange: (next: number) => void;
  onResetRiserCount: () => void;
};

export function ReadoutPanel({ stair, suggestedRiserCount, onRiserCountChange, onResetRiserCount }: Props) {
  const overridden = stair.riserCount !== suggestedRiserCount;

  return (
    <section className={styles.panel} aria-label="Staircase dimensions">
      <div className={styles.stepper}>
        <div className={styles.stepperHead}>
          <span className={styles.stepperLabel}>Steps</span>
          {overridden ? (
            <button type="button" className={styles.reset} onClick={onResetRiserCount}>
              Reset to {suggestedRiserCount}
            </button>
          ) : (
            <span className={styles.suggested}>suggested</span>
          )}
        </div>
        <div className={styles.stepperControls}>
          <button
            type="button"
            className={styles.step}
            aria-label="One fewer step"
            disabled={stair.riserCount <= 1}
            onClick={() => onRiserCountChange(stair.riserCount - 1)}
          >
            <Minus />
          </button>
          <output className={`${styles.stepValue} mono`}>{stair.riserCount}</output>
          <button
            type="button"
            className={styles.step}
            aria-label="One more step"
            onClick={() => onRiserCountChange(stair.riserCount + 1)}
          >
            <Plus />
          </button>
        </div>
        <p className={styles.stepperNote}>Rise is derived from the step count.</p>
      </div>

      <dl className={styles.readouts}>
        <Readout label="Rise" value={formatFeetInches(stair.riseInch)} title="Height of each step" />
        <Readout label="Run" value={formatFeetInches(stair.runInch)} title="Going — depth of each step, nose to nose" />
        <Readout label="Tread depth" value={formatFeetInches(stair.treadDepthInch)} title="Cut depth of the tread board (run + nosing)" />
        <Readout label="Treads" value={String(stair.treadCount)} />
        <Readout label="Headroom" value={formatFeetInches(stair.headroomInch)} title="Clearance at the stairwell opening" />
        <Readout label="Width" value={formatFeetInches(stair.widthInch)} />
        <Readout label="Footprint" value={formatFeetInches(stair.totalRunInch)} title="Total horizontal run" />
        <Readout label="Balusters" value={`${stair.balusterCount}`} title={`${stair.balustersPerTread} per tread`} />
      </dl>
    </section>
  );
}

function Readout({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className={styles.row} title={title}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={`${styles.rowValue} mono`}>{value}</dd>
    </div>
  );
}

function Minus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function Plus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
