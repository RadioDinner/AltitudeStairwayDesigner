"use client";
import { useMemo, useState } from "react";
import { generate, IRC } from "@/lib/engine";
import { catalogView } from "./catalog";
import { IntakeForm, type IntakeValues } from "./IntakeForm";
import { ResultView } from "./ResultView";
import styles from "./Configurator.module.css";

const EMPTY: IntakeValues = {
  totalRiseInch: null,
  ceilingHeightInch: null,
  runLengthInch: null,
  widthInch: null,
  stairwellOpeningLengthInch: null,
};

export default function Configurator() {
  const [values, setValues] = useState<IntakeValues>(EMPTY);
  const [riserOverride, setRiserOverride] = useState<number | undefined>(undefined);
  const [phase, setPhase] = useState<"intake" | "result">("intake");

  const canCompute = values.totalRiseInch != null && values.ceilingHeightInch != null;

  const result = useMemo(() => {
    if (values.totalRiseInch == null || values.ceilingHeightInch == null) return null;
    return generate(catalogView, {
      totalRiseInch: values.totalRiseInch,
      ceilingHeightInch: values.ceilingHeightInch,
      runLengthInch: values.runLengthInch ?? undefined,
      widthInch: values.widthInch ?? undefined,
      stairwellOpeningLengthInch: values.stairwellOpeningLengthInch ?? undefined,
      riserCount: riserOverride,
    });
  }, [values, riserOverride]);

  const suggestedRiserCount =
    values.totalRiseInch != null ? Math.max(1, Math.ceil(values.totalRiseInch / IRC.maxRiseInch)) : 1;

  const handleChange = (patch: Partial<IntakeValues>) => {
    // a new total rise invalidates a manual step-count override
    if (patch.totalRiseInch !== undefined) setRiserOverride(undefined);
    setValues((v) => ({ ...v, ...patch }));
  };

  if (phase === "result" && result) {
    return (
      <main className={styles.result}>
        <ResultView
          stair={result.stair}
          warnings={result.warnings}
          suggestedRiserCount={suggestedRiserCount}
          onRiserCountChange={(next) => setRiserOverride(Math.max(1, next))}
          onResetRiserCount={() => setRiserOverride(undefined)}
          onEdit={() => setPhase("intake")}
        />
      </main>
    );
  }

  return (
    <main className={styles.intake}>
      <header className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.wordmark}>Altitude</span>
      </header>
      <div className={styles.stage}>
        <IntakeForm values={values} onChange={handleChange} onSubmit={() => canCompute && setPhase("result")} />
      </div>
    </main>
  );
}
