"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Buttons";
import { CountUp } from "./ui/CountUp";
import { useDelayScale } from "./ui/motion";
import { FUTURE_ME_STAGE_TIMINGS_MS } from "@/lib/constants";
import { formatYen } from "@/lib/format";

interface FutureMeModalProps {
  amount: number;
  open: boolean;
  onClose: () => void;
}

const line = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function FutureMeModal({ amount, open, onClose }: FutureMeModalProps) {
  const [stage, setStage] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const delayScale = useDelayScale();

  useEffect(() => {
    if (!open) return;

    // 段階表示のタイマー（stage は閉じるアニメーション完了時に 0 へ戻す）
    const timers = FUTURE_ME_STAGE_TIMINGS_MS.map((ms, i) =>
      window.setTimeout(() => setStage(i), Math.round(ms * delayScale)),
    );

    // フォーカス管理：開いたら閉じるボタンへ、閉じたら開いた要素へ戻す
    openerRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, onClose, delayScale]);

  return (
    <AnimatePresence onExitComplete={() => setStage(0)}>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="未来のあなたへ送金"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-paper"
        >
          <div className="flex items-center justify-between px-5 py-2 font-mono text-[11px] tracking-[0.2em] text-paper/60">
            <span>TRANSFER TO FUTURE YOU</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="-mr-3 inline-flex min-h-11 min-w-11 items-center justify-center px-3 underline underline-offset-4 hover:text-paper focus-visible:outline-2 focus-visible:outline-accent"
            >
              閉じる
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
            <div className="space-y-6 text-lg" aria-live="polite">
              {stage >= 0 && (
                <motion.p {...line} className="font-bold">
                  了解しました。
                </motion.p>
              )}
              {stage >= 1 && (
                <motion.p {...line} className="text-paper/80">
                  <span className="font-mono">{formatYen(amount)}</span>を未来のあなたに送金します。
                </motion.p>
              )}
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="border-2 border-paper/30 px-5 py-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="emoji text-5xl leading-none" aria-hidden="true">
                      👴
                    </span>
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.2em] text-paper/60">未来のあなた</p>
                      <p className="font-mono text-3xl font-semibold tabular-nums text-accent">
                        +<CountUp value={amount} duration={1.2} format={formatYen} />
                        <span className="sr-only">{formatYen(amount)}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {stage >= 3 && (
                <motion.p {...line}>
                  <span className="mr-3 font-mono text-[11px] tracking-[0.2em] text-paper/60">未来のあなた</span>
                  <span className="font-bold">「ありがとう。」</span>
                </motion.p>
              )}
              {stage >= 4 && (
                <motion.p {...line}>
                  <span className="mr-3 font-mono text-[11px] tracking-[0.2em] text-paper/60">現在のあなた</span>
                  <span className="font-bold">「…………。」</span>
                </motion.p>
              )}
            </div>

            <div className="mt-12 min-h-[64px]">
              {stage >= 5 && (
                <motion.div {...line}>
                  <Button size="lg" variant="inverse" onClick={onClose}>
                    やっぱり少し使う
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
