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
  enterKeyHint?: "next" | "done";
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
  enterKeyHint = "next",
}: CurrencyInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="border-b border-line pb-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs tracking-[0.2em] text-accent-deep">{label}</span>
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
        className={`mt-4 flex items-baseline gap-2 border-b-2 pb-2 transition-colors focus-within:border-accent-deep ${
          error ? "border-accent" : "border-ink"
        }`}
      >
        <span className="font-mono text-2xl text-ink-soft" aria-hidden="true">
          ¥
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint={enterKeyHint}
          autoFocus={autoFocus}
          value={value === null ? "" : formatNumber(value)}
          onChange={(event) => onChange(parseYenInput(event.target.value, MAX_YEN_INPUT))}
          onKeyDown={(event) => {
            // カンマの直後で Backspace を押したときは、カンマの前の数字を消す
            if (event.key !== "Backspace") return;
            const el = event.currentTarget;
            const pos = el.selectionStart;
            if (pos === null || pos !== el.selectionEnd || pos === 0) return;
            if (el.value[pos - 1] !== ",") return;
            event.preventDefault();
            const next = el.value.slice(0, Math.max(0, pos - 2)) + el.value.slice(pos);
            onChange(parseYenInput(next, MAX_YEN_INPUT));
          }}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className="min-w-0 flex-1 bg-transparent font-mono text-4xl font-medium tabular-nums tracking-tight outline-none placeholder:text-ink-faint"
        />
        <span className="text-sm text-ink-soft">円</span>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm font-bold text-accent-deep">
          {error}
        </p>
      ) : warning ? (
        <p className="mt-2 text-sm text-ink-soft text-pretty">{warning}</p>
      ) : null}
    </div>
  );
}
