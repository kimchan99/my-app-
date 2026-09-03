"use client";

import { MAX_YEN_INPUT } from "@/lib/constants";
import { formatNumber, parseYenInput } from "@/lib/format";
import { useId } from "react";

interface CurrencyInputProps {
  label: string;
  question: string;
  hint?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  error?: string;
  warning?: string;
  autoFocus?: boolean;
}

export function CurrencyInput({
  label,
  question,
  hint,
  value,
  onChange,
  placeholder,
  error,
  warning,
  autoFocus,
}: CurrencyInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="border-b border-line pb-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs tracking-[0.2em] text-accent">{label}</span>
        <label htmlFor={id} className="text-xl font-bold leading-snug">
          {question}
        </label>
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      <div
        className={`mt-4 flex items-baseline gap-2 border-b-2 pb-2 transition-colors ${
          error ? "border-accent" : "border-ink"
        }`}
      >
        <span className="font-mono text-2xl text-ink-faint" aria-hidden="true">
          ¥
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          autoFocus={autoFocus}
          value={value === null ? "" : formatNumber(value)}
          onChange={(event) => onChange(parseYenInput(event.target.value, MAX_YEN_INPUT))}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className="min-w-0 flex-1 bg-transparent font-mono text-4xl font-medium tabular-nums tracking-tight outline-none placeholder:text-ink-faint/60"
        />
        <span className="text-sm text-ink-soft">円</span>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm font-bold text-accent">
          {error}
        </p>
      ) : warning ? (
        <p className="mt-2 text-sm text-ink-soft">{warning}</p>
      ) : null}
    </div>
  );
}
