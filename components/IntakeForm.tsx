"use client";
import { useState } from "react";
import { DimensionField } from "./DimensionField";
import { formatFeetInches } from "@/lib/engine";
import styles from "./IntakeForm.module.css";

export type IntakeValues = {
  totalRiseInch: number | null;
  ceilingHeightInch: number | null;
  runLengthInch: number | null;
  widthInch: number | null;
  stairwellOpeningLengthInch: number | null;
};

type Props = {
  values: IntakeValues;
  onChange: (patch: Partial<IntakeValues>) => void;
  onSubmit: () => void;
};

const asText = (v: number | null): string => (v == null ? "" : formatFeetInches(v));

export function IntakeForm({ values, onChange, onSubmit }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const canSubmit = values.totalRiseInch != null && values.ceilingHeightInch != null;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      noValidate
    >
      <header className={styles.head}>
        <h1 className={styles.title}>Design your staircase</h1>
        <p className={styles.lede}>
          Two numbers about your space are all it takes to see a real,
          code-compliant staircase in 3D. You can refine everything after.
        </p>
      </header>

      <div className={styles.required}>
        <DimensionField
          label="Total rise"
          hint="Finished floor to finished floor"
          placeholder="e.g. 9' 1-3/4&quot;"
          required
          autoFocus
          value={values.totalRiseInch}
          initialText={asText(values.totalRiseInch)}
          onChange={(v) => onChange({ totalRiseInch: v })}
        />
        <DimensionField
          label="Ceiling height"
          hint="Floor to ceiling on the lower level"
          placeholder="e.g. 9'"
          required
          value={values.ceilingHeightInch}
          initialText={asText(values.ceilingHeightInch)}
          onChange={(v) => onChange({ ceilingHeightInch: v })}
        />
      </div>

      <div className={styles.details}>
        <button
          type="button"
          className={styles.disclosure}
          aria-expanded={showDetails}
          aria-controls="intake-details"
          onClick={() => setShowDetails((s) => !s)}
        >
          <Chevron open={showDetails} />
          {showDetails ? "Hide details" : "Add details"}
          <span className={styles.optional}>optional</span>
        </button>

        <div id="intake-details" className={styles.detailsBody} hidden={!showDetails}>
          <DimensionField
            label="Available run"
            hint="Horizontal space for the stair — we'll flag if it won't fit"
            placeholder="e.g. 13'"
            value={values.runLengthInch}
            initialText={asText(values.runLengthInch)}
            onChange={(v) => onChange({ runLengthInch: v })}
          />
          <DimensionField
            label="Stair width"
            hint="Defaults to 42″"
            placeholder="42&quot;"
            value={values.widthInch}
            initialText={asText(values.widthInch)}
            onChange={(v) => onChange({ widthInch: v })}
          />
          <DimensionField
            label="Stairwell opening"
            hint="Opening length in the floor above — defaults to the full run"
            placeholder="full run"
            value={values.stairwellOpeningLengthInch}
            initialText={asText(values.stairwellOpeningLengthInch)}
            onChange={(v) => onChange({ stairwellOpeningLengthInch: v })}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.cta} disabled={!canSubmit}>
          See my staircase
          <ArrowRight />
        </button>
        <p className={styles.reassure} aria-live="polite">
          {canSubmit ? "Code-checked as you go · no sign-up" : "Enter both measurements to continue"}
        </p>
      </div>
    </form>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={styles.chevron} data-open={open} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
