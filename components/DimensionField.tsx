"use client";
import { useId, useState } from "react";
import { parseFeetInches } from "@/lib/ui/feetInches";
import { formatFeetInches } from "@/lib/engine";
import styles from "./DimensionField.module.css";

type Props = {
  label: string;
  value: number | null;
  onChange: (inches: number | null) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  autoFocus?: boolean;
  initialText?: string;
};

/**
 * A feet-inches-fractions input. Parses to exact decimal inches at the edge
 * (ADR 0022) and echoes the normalized reading back as a mono confirmation, so the
 * user always sees exactly what the tool understood.
 */
export function DimensionField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
  autoFocus,
  initialText = "",
}: Props) {
  const id = useId();
  const [text, setText] = useState(initialText);
  const trimmed = text.trim();
  const parsed = parseFeetInches(text);
  const invalid = trimmed !== "" && parsed === null;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? <span className={styles.req} aria-hidden="true"> ·</span> : null}
      </label>

      <div className={styles.inputWrap} data-invalid={invalid || undefined}>
        <input
          id={id}
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={text}
          aria-invalid={invalid}
          aria-describedby={`${id}-note`}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parseFeetInches(e.target.value));
          }}
        />
      </div>

      <p id={`${id}-note`} className={styles.note} data-state={invalid ? "error" : parsed !== null ? "ok" : "hint"}>
        {invalid ? (
          "Try feet and inches, like 9' 1-3/4\""
        ) : parsed !== null ? (
          <>
            <span className={styles.noteEq}>=</span>
            <span className="mono">{formatFeetInches(parsed)}</span>
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  );
}
