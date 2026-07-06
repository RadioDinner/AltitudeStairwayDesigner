"use client";
import type { Warning } from "@/lib/engine";
import styles from "./WarningsList.module.css";

/**
 * Advisory warnings — attention, not alarm; conveyed by icon + text, never color
 * alone (DESIGN.md). They guide and never block (ADR 0003).
 */
export function WarningsList({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) {
    return (
      <div className={styles.clear} role="status">
        <CheckIcon />
        <div>
          <p className={styles.clearTitle}>Meets the code checks</p>
          <p className={styles.clearNote}>Rise, run, headroom, and guard spacing all pass.</p>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.wrap} aria-label={`${warnings.length} advisory warning${warnings.length > 1 ? "s" : ""}`}>
      <ul className={styles.list}>
        {warnings.map((w) => (
          <li key={w.code} className={styles.item} data-kind={w.category}>
            <span className={styles.icon} aria-hidden="true">
              <AlertIcon />
            </span>
            <div className={styles.body}>
              <span className={styles.badge} data-kind={w.category}>
                {w.category === "code" ? "Code" : "Fit"}
              </span>
              <p className={styles.message}>{w.message}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.footnote}>Advisories guide — they never block. You stay in control.</p>
    </section>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l6.5 11.5H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.2" r="0.85" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.checkSvg}>
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.8 9.2l2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
