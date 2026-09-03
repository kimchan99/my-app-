"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/Buttons";
import { FORM_NUMBER, HERO_NOTES, ISSUER_NAME, ISSUER_NAME_EN } from "@/lib/constants";

interface HeroProps {
  onStart: () => void;
}

const MARQUEE_ITEMS = [
  "無駄遣い審査 受付中",
  "本日の許可率 98.2%",
  "審査時間 約2秒",
  "手数料 無料",
  "不服申し立て 不可",
];

export function Hero({ onStart }: HeroProps) {
  return (
    <section className="flex min-h-[100svh] flex-col">
      <header className="flex items-center justify-between border-b-2 border-ink px-5 py-3 font-mono text-[11px] tracking-[0.18em] text-ink-soft">
        <span>{ISSUER_NAME}</span>
        <span>{FORM_NUMBER}</span>
      </header>

      <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.3em] text-ink-soft"
        >
          {ISSUER_NAME_EN}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="display mt-6 text-[12.5vw] font-black sm:text-7xl"
        >
          老後のあなた、
          <br />
          ちょっと<span className="text-accent">金持ち</span>
          <br />
          <span className="text-accent">すぎ</span>ません？
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="mt-8 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg"
        >
          あなたが今、罪悪感なく無駄遣いしていい金額を
          <span className="font-bold text-ink">勝手に</span>
          審査します。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="mt-10 max-w-md"
        >
          <Button size="lg" onClick={onStart}>
            無駄遣い審査を受ける →
          </Button>
          <ul className="mt-5 space-y-1 text-[11px] leading-relaxed text-ink-soft">
            {HERO_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div
        className="overflow-hidden border-y-2 border-ink bg-ink py-2 text-paper"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-xs tracking-[0.2em]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`} className="px-6">
              {item} <span className="text-accent">●</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
