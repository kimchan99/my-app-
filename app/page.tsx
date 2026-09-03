"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { JudgingAnimation } from "@/components/JudgingAnimation";
import { MoneyValueSimulator } from "@/components/MoneyValueSimulator";
import type { PermitCardData } from "@/components/PermitCard";
import { PermitResult } from "@/components/PermitResult";
import { WasteForm } from "@/components/WasteForm";
import { calculatePermit } from "@/lib/calculations";
import { DEFAULT_AGE, MAX_AGE, MIN_AGE } from "@/lib/constants";
import { endOfMonthLabel, generateSerial, issueDateLabel } from "@/lib/format";
import { loadStoredInputs, saveStoredInputs, type StoredInputs } from "@/lib/storage";

type Step = "hero" | "value" | "form" | "judging" | "result";

const INITIAL_INPUTS: StoredInputs = {
  age: DEFAULT_AGE,
  name: "",
  monthlyIncome: null,
  monthlyExpenses: null,
  savings: null,
  fearLevel: 3,
};

function mergeStored(base: StoredInputs, stored: Partial<StoredInputs> | null): StoredInputs {
  if (!stored) return base;
  const age =
    typeof stored.age === "number" && stored.age >= MIN_AGE && stored.age <= MAX_AGE ? stored.age : base.age;
  const fearLevel =
    typeof stored.fearLevel === "number" && stored.fearLevel >= 1 && stored.fearLevel <= 5
      ? stored.fearLevel
      : base.fearLevel;
  return {
    age,
    name: typeof stored.name === "string" ? stored.name.slice(0, 16) : base.name,
    monthlyIncome: typeof stored.monthlyIncome === "number" ? stored.monthlyIncome : base.monthlyIncome,
    monthlyExpenses: typeof stored.monthlyExpenses === "number" ? stored.monthlyExpenses : base.monthlyExpenses,
    savings: typeof stored.savings === "number" ? stored.savings : base.savings,
    fearLevel,
  };
}

const stepTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35 },
};

export default function Home() {
  const [step, setStep] = useState<Step>("hero");
  const [inputs, setInputs] = useState<StoredInputs>(INITIAL_INPUTS);
  const [result, setResult] = useState<PermitCardData | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  const handleStart = () => {
    // localStorage は初回描画と一致させるため、操作時にだけ読む
    setInputs((current) => mergeStored(current, loadStoredInputs()));
    setStep("value");
  };

  const patchInputs = useCallback((patch: Partial<StoredInputs>) => {
    setInputs((current) => ({ ...current, ...patch }));
  }, []);

  const handleSubmit = () => {
    if (inputs.monthlyIncome === null || inputs.monthlyExpenses === null || inputs.savings === null) return;
    const permit = calculatePermit({
      monthlyIncome: inputs.monthlyIncome,
      monthlyExpenses: inputs.monthlyExpenses,
      savings: inputs.savings,
      fearLevel: inputs.fearLevel,
    });
    const now = new Date();
    setResult({
      name: inputs.name.trim(),
      amount: permit.permitAmount,
      isGrounded: permit.isGrounded,
      serial: generateSerial(now),
      issueDate: issueDateLabel(now),
      expiryDate: endOfMonthLabel(now),
    });
    saveStoredInputs(inputs);
    setStep("judging");
  };

  const handleJudged = useCallback(() => setStep("result"), []);

  return (
    <main className="min-h-[100svh]">
      <AnimatePresence mode="wait">
        {step === "hero" && (
          <motion.div key="hero" {...stepTransition}>
            <Hero onStart={handleStart} />
          </motion.div>
        )}
        {step === "value" && (
          <motion.div key="value" {...stepTransition}>
            <MoneyValueSimulator
              age={inputs.age}
              onAgeChange={(age) => patchInputs({ age })}
              onNext={() => setStep("form")}
            />
          </motion.div>
        )}
        {step === "form" && (
          <motion.div key="form" {...stepTransition}>
            <WasteForm values={inputs} onChange={patchInputs} onSubmit={handleSubmit} />
          </motion.div>
        )}
        {step === "judging" && (
          <motion.div key="judging" {...stepTransition}>
            <JudgingAnimation onComplete={handleJudged} />
          </motion.div>
        )}
        {step === "result" && result && (
          <motion.div key="result" {...stepTransition}>
            <PermitResult data={result} onRetry={() => setStep("form")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
