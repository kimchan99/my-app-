"use client";

import { useState } from "react";
import { Button } from "./ui/Buttons";
import { CurrencyInput } from "./ui/CurrencyInput";
import { StepHeader } from "./ui/StepHeader";
import { FEAR_LEVELS, type FearLevel } from "@/lib/constants";
import type { StoredInputs } from "@/lib/storage";

interface WasteFormProps {
  values: StoredInputs;
  onChange: (patch: Partial<StoredInputs>) => void;
  onSubmit: () => void;
}

interface FormErrors {
  monthlyIncome?: string;
  monthlyExpenses?: string;
  savings?: string;
}

export function WasteForm({ values, onChange, onSubmit }: WasteFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempted, setAttempted] = useState(false);

  const validate = (v: StoredInputs): FormErrors => {
    const next: FormErrors = {};
    if (v.monthlyIncome === null) next.monthlyIncome = "手取り月収を入力してください。";
    else if (v.monthlyIncome <= 0) next.monthlyIncome = "0円だと審査のしようがありません。";
    if (v.monthlyExpenses === null) next.monthlyExpenses = "生活費を入力してください。0でも構いません（本当に？）";
    if (v.savings === null) next.savings = "貯金額を入力してください。0でも大丈夫です。";
    return next;
  };

  const handleChange = (patch: Partial<StoredInputs>) => {
    onChange(patch);
    if (attempted) setErrors(validate({ ...values, ...patch }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    setAttempted(true);
    if (Object.keys(next).length === 0) onSubmit();
  };

  const fear = FEAR_LEVELS.find((f) => f.level === values.fearLevel) ?? FEAR_LEVELS[2];
  const expensesExceedIncome =
    values.monthlyIncome !== null &&
    values.monthlyExpenses !== null &&
    values.monthlyExpenses > values.monthlyIncome;

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-lg flex-col px-5 py-6 sm:px-8">
      <StepHeader index={2} total={4} title="無駄遣い審査" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col pt-10">
        <h2 className="display text-3xl font-black sm:text-4xl">
          正直に
          <br />
          答えてください。
        </h2>
        <p className="mt-3 text-sm text-ink-soft">数字はこの端末の中だけで処理します。誰にも送りません。</p>

        <div className="mt-10 space-y-8">
          <div className="border-b border-line pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs tracking-[0.2em] text-accent">Q0</span>
              <label htmlFor="name" className="text-xl font-bold leading-snug">
                許可証に載せる名前
              </label>
            </div>
            <p className="mt-1 text-xs text-ink-soft">任意。ニックネームでOK。</p>
            <div className="mt-4 flex items-baseline gap-2 border-b-2 border-ink pb-2">
              <input
                id="name"
                type="text"
                maxLength={16}
                autoComplete="nickname"
                value={values.name}
                onChange={(event) => handleChange({ name: event.target.value })}
                placeholder="AYANO"
                className="min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-ink-faint/60"
              />
              <span className="text-sm text-ink-soft">様</span>
            </div>
          </div>

          <CurrencyInput
            label="Q1"
            question="月いくら稼いでる？"
            hint="手取りの月収。ボーナスは一旦忘れてください。"
            value={values.monthlyIncome}
            onChange={(v) => handleChange({ monthlyIncome: v })}
            placeholder="350,000"
            error={errors.monthlyIncome}
          />

          <CurrencyInput
            label="Q2"
            question="毎月、生きるだけでいくら消える？"
            hint="家賃・食費・光熱費・通信費など、ぜんぶまとめて。"
            value={values.monthlyExpenses}
            onChange={(v) => handleChange({ monthlyExpenses: v })}
            placeholder="220,000"
            error={errors.monthlyExpenses}
            warning={expensesExceedIncome ? "収入より多く消えています。審査は続行しますが、心配です。" : undefined}
          />

          <CurrencyInput
            label="Q3"
            question="今いくら持ってる？"
            hint="貯金の合計。だいたいでいいです。"
            value={values.savings}
            onChange={(v) => handleChange({ savings: v })}
            placeholder="1,000,000"
            error={errors.savings}
          />

          <div className="border-b border-line pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs tracking-[0.2em] text-accent">Q4</span>
              <label htmlFor="fear" className="text-xl font-bold leading-snug">
                老後、どのくらいビビってる？
              </label>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-5xl leading-none" aria-hidden="true">
                {fear.emoji}
              </span>
              <div>
                <p className="text-lg font-bold" aria-live="polite">
                  {fear.label}
                </p>
                <p className="font-mono text-xs tracking-[0.15em] text-ink-soft">
                  LEVEL {fear.level} / {FEAR_LEVELS.length}
                </p>
              </div>
            </div>

            <input
              id="fear"
              type="range"
              min={1}
              max={5}
              step={1}
              value={values.fearLevel}
              onChange={(event) => handleChange({ fearLevel: Number(event.target.value) as FearLevel })}
              aria-valuetext={`${fear.label}（${fear.level}／5）`}
              className="fear-slider mt-3"
            />
            <div className="flex justify-between text-xs text-ink-soft" aria-hidden="true">
              <span>😎 全然平気</span>
              <span>😭 めちゃ怖い</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button type="submit" size="lg">
            審査する
          </Button>
          <p className="mt-3 text-center text-[11px] text-ink-soft">※審査結果に対する不服申し立ては受け付けていません。</p>
        </div>
      </form>
    </section>
  );
}
