"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { JUDGING_DURATION_MS, JUDGING_MESSAGE_INTERVAL_MS, JUDGING_MESSAGES } from "@/lib/constants";

interface JudgingAnimationProps {
  onComplete: () => void;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function JudgingAnimation({ onComplete }: JudgingAnimationProps) {
  const [messages] = useState(() => shuffle(JUDGING_MESSAGES));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, JUDGING_MESSAGE_INTERVAL_MS);
    const timeout = window.setTimeout(onComplete, JUDGING_DURATION_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [messages.length, onComplete]);

  return (
    <section
      className="flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-paper"
      role="status"
      aria-live="polite"
    >
      <p className="font-mono text-[11px] tracking-[0.3em] text-paper/60">NOW JUDGING</p>
      <h2 className="display mt-4 text-5xl font-black sm:text-6xl">
        審査中
        <span className="animate-blink">……</span>
      </h2>

      <div className="mt-10 h-8 overflow-hidden">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center text-base text-paper/80"
        >
          {messages[index]}
        </motion.p>
      </div>

      <div className="mt-12 h-1 w-56 overflow-hidden bg-paper/20">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: JUDGING_DURATION_MS / 1000, ease: "linear" }}
          className="h-full w-full bg-accent"
        />
      </div>
    </section>
  );
}
