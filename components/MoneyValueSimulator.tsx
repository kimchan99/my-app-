"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Button } from "./ui/Buttons";
import { CountUp } from "./ui/CountUp";
import { StepHeader } from "./ui/StepHeader";
import {
  INFLATION_DISCLAIMER_TEXT,
  INFLATION_RATE,
  MAX_AGE,
  MIN_AGE,
  REFERENCE_AMOUNT,
  RETIREMENT_AGE,
} from "@/lib/constants";
import { presentValueOfFutureMoney, roundToTenThousand, yearsUntilRetirement } from "@/lib/calculations";
import { formatManYen, formatYen } from "@/lib/format";

interface MoneyValueSimulatorProps {
  age: number;
  onAgeChange: (age: number) => void;
  onNext: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function MoneyValueSimulator({ age, onAgeChange, onNext }: MoneyValueSimulatorProps) {
  const [ageText, setAgeText] = useState(String(age));
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [countDone, setCountDone] = useState(false);

  const years = yearsUntilRetirement(age);
  const alreadyRetired = years === 0;
  const presentValue = presentValueOfFutureMoney(age);
  const displayValue = roundToTenThousand(presentValue);

  const handleCalculate = () => {
    const parsed = Number.parseInt(ageText.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(parsed) || parsed < MIN_AGE || parsed > MAX_AGE) {
      setError(`${MIN_AGE}〜${MAX_AGE}歳の間で入力してください。`);
      return;
    }
    setError(null);
    onAgeChange(parsed);
    setCountDone(false);
    setRevealed(true);
  };

  const handleCountDone = useCallback(() => setCountDone(true), []);

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-lg flex-col px-5 py-6 sm:px-8">
      <StepHeader index={1} total={4} title="100万円の価値" />

      <div className="flex flex-1 flex-col pt-10">
        <h2 className="display text-3xl font-black sm:text-4xl">
          あなたは現在
          <br />
          何歳ですか？
        </h2>

        <div className="mt-8 flex items-end gap-3 border-b-2 border-ink pb-2">
          <label htmlFor="age" className="sr-only">
            現在の年齢
          </label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            min={MIN_AGE}
            max={MAX_AGE}
            value={ageText}
            onChange={(event) => {
              setAgeText(event.target.value);
              if (revealed) setRevealed(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCalculate();
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "age-error" : undefined}
            className="w-32 bg-transparent font-mono text-6xl font-medium tabular-nums outline-none"
          />
          <span className="pb-2 text-xl font-bold">歳</span>
          <span className="ml-auto pb-2 text-right font-mono text-xs tracking-[0.15em] text-ink-soft">
            老後年齢
            <br />
            <span className="text-ink">{RETIREMENT_AGE}歳</span>
          </span>
        </div>
        {error && (
          <p id="age-error" role="alert" className="mt-2 text-sm font-bold text-accent">
            {error}
          </p>
        )}

        {!revealed && (
          <div className="mt-8">
            <Button size="lg" onClick={handleCalculate}>
              今の100万円を{RETIREMENT_AGE}歳まで取っておいたら？
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {revealed && (
            <motion.div
              key={age}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 space-y-8"
            >
              <div className="ruled border-t-2 border-ink pt-4">
                <p className="font-mono text-[11px] tracking-[0.2em] text-ink-soft">
                  今の100万円を{RETIREMENT_AGE}歳まで取っておいたら？
                </p>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">現在 {age}歳</span>
                  <span className="font-mono text-2xl font-medium tabular-nums">
                    {formatYen(REFERENCE_AMOUNT)}
                  </span>
                </div>

                <div className="my-3 flex items-center gap-3 text-ink-soft">
                  <span className="text-2xl leading-none">↓</span>
                  <span className="font-mono text-xs tracking-[0.15em]">
                    {alreadyRetired ? "もう老後です" : `${years}年後・年${INFLATION_RATE * 100}%のインフレ`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">{RETIREMENT_AGE}歳の100万円は</span>
                  <span className="font-mono text-2xl font-medium tabular-nums">
                    {formatYen(REFERENCE_AMOUNT)}
                  </span>
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-xs text-ink-soft">今の購買力に換算すると</p>
                  <p className="display mt-1 font-mono text-[15vw] font-medium tabular-nums text-accent sm:text-7xl">
                    <CountUp
                      value={displayValue}
                      duration={1.6}
                      delay={0.3}
                      format={(v) => formatYen(roundToTenThousand(v))}
                      onComplete={handleCountDone}
                    />
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {countDone && (
                  <motion.div key="copy" className="space-y-6">
                    <motion.p
                      {...fadeUp}
                      transition={{ duration: 0.5 }}
                      className="display text-3xl font-black sm:text-4xl"
                    >
                      {alreadyRetired ? (
                        <>
                          未来の100万円、
                          <br />
                          もう届いてます。
                        </>
                      ) : (
                        <>
                          未来の100万円、
                          <br />
                          今の感覚だと
                          <span className="text-accent">{formatManYen(displayValue)}</span>。
                        </>
                      )}
                    </motion.p>

                    <motion.p
                      {...fadeUp}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="text-base text-ink-soft"
                    >
                      もちろん未来の100万円も大事です。
                    </motion.p>

                    <motion.p
                      {...fadeUp}
                      transition={{ duration: 0.5, delay: 2.1 }}
                      className="text-xl font-bold"
                    >
                      {alreadyRetired
                        ? "なので、今すぐ使ってください。"
                        : (
                            <>
                              でも{age}歳のあなたも
                              <br />
                              100万円欲しそうです。
                            </>
                          )}
                    </motion.p>

                    <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 2.8 }} className="pt-2">
                      <Button size="lg" onClick={onNext}>
                        無駄遣い審査へ進む →
                      </Button>
                      <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
                        {INFLATION_DISCLAIMER_TEXT}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
