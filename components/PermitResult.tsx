"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Disclaimer } from "./Disclaimer";
import { FutureMeModal } from "./FutureMeModal";
import { PermitCard, type PermitCardData } from "./PermitCard";
import { Recommendations } from "./Recommendations";
import { Button } from "./ui/Buttons";
import { CountUp } from "./ui/CountUp";
import { StepHeader } from "./ui/StepHeader";
import { Stamp } from "./ui/Stamp";
import { notoSansJP, plexMono, shipporiMincho } from "@/app/fonts";
import { CLOSING_MESSAGE, GROUNDED_MESSAGE } from "@/lib/constants";
import { formatYen } from "@/lib/format";
import { renderPermitImage } from "@/lib/permitImage";
import { buildShareText, savePermitImage, shareResult } from "@/lib/share";

interface PermitResultProps {
  data: PermitCardData;
  onRetry: () => void;
}

const reveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function PermitResult({ data, onRetry }: PermitResultProps) {
  const [countDone, setCountDone] = useState(data.isGrounded);
  const [futureOpen, setFutureOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"share" | "save" | null>(null);

  const handleCountDone = useCallback(() => setCountDone(true), []);
  const closeFuture = useCallback(() => setFutureOpen(false), []);

  const handleShare = async () => {
    setBusy("share");
    setNotice(null);
    const outcome = await shareResult(buildShareText(data.amount, data.isGrounded));
    if (outcome === "copied") setNotice("シェア文をクリップボードにコピーしました。");
    if (outcome === "failed") setNotice("シェアできませんでした。スクショでどうぞ。");
    setBusy(null);
  };

  const handleSave = async () => {
    setBusy("save");
    setNotice(null);
    try {
      const blob = await renderPermitImage(data, {
        sans: notoSansJP.style.fontFamily,
        mincho: shipporiMincho.style.fontFamily,
        mono: plexMono.style.fontFamily,
      });
      const outcome = await savePermitImage(blob, `mudazukai-permit-${data.serial.replace(/[^\d-]/g, "")}.png`);
      if (outcome === "downloaded") setNotice("許可証の画像を保存しました。");
    } catch {
      setNotice("画像を作れませんでした。スクショでどうぞ。");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-lg flex-col px-5 py-6 sm:px-8">
      <StepHeader index={4} total={4} title="審査結果" />

      {/* 結果のヘッドライン */}
      <div className="relative pt-10">
        <div className="absolute right-0 top-6">
          <Stamp text="審査済" variant="box" size={80} rotate={8} delay={0.2} className="px-3 py-1" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-ink-soft">RESULT</p>
        <h2 className="display mt-2 text-4xl font-black sm:text-5xl">審査結果</h2>

        {data.isGrounded ? (
          <motion.div {...reveal} transition={{ duration: 0.6, delay: 0.4 }} className="mt-8">
            <p className="text-lg text-ink-soft">あなたは今月、</p>
            <p className="display mt-2 text-[10.5vw] font-black text-accent sm:text-5xl">{GROUNDED_MESSAGE}</p>
          </motion.div>
        ) : (
          <div className="mt-8">
            <p className="text-lg text-ink-soft">あなたは今月</p>
            <p className="display mt-1 font-mono text-[19vw] font-semibold tabular-nums tracking-tight sm:text-8xl">
              <CountUp value={data.amount} duration={1.8} delay={0.5} format={formatYen} onComplete={handleCountDone} />
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: countDone ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="mt-1 text-2xl font-bold"
            >
              まで無駄遣いしてOKです。
            </motion.p>
          </div>
        )}
      </div>

      {/* 許可証 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: countDone ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="mt-12"
      >
        {countDone && (
          <>
            <p className="mb-4 text-center font-mono text-[11px] tracking-[0.3em] text-ink-soft">
              ▼ 許可証を発行しました ▼
            </p>
            <PermitCard data={data} stampDelay={0.9} />
            <p className="mt-3 text-center text-[11px] text-ink-soft">スクショ推奨。ストーリーズにも収まります。</p>
          </>
        )}
      </motion.div>

      {countDone && (
        <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.7 }} className="mt-10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleShare} disabled={busy !== null}>
              {busy === "share" ? "準備中…" : "結果をシェア"}
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={busy !== null}>
              {busy === "save" ? "生成中…" : "画像を保存"}
            </Button>
          </div>
          {!data.isGrounded && (
            <Button variant="secondary" onClick={() => setFutureOpen(true)}>
              このお金、使わない
            </Button>
          )}
          <Button variant="ghost" onClick={onRetry}>
            もう一度審査を受ける
          </Button>
          <p className="min-h-[1.25rem] text-center text-xs text-ink-soft" role="status" aria-live="polite">
            {notice}
          </p>
        </motion.div>
      )}

      {countDone && (
        <motion.div {...reveal} transition={{ duration: 0.5, delay: 1.0 }} className="mt-14 space-y-14">
          <Recommendations amount={data.amount} isGrounded={data.isGrounded} />

          <div className="py-6 text-center">
            <p className="display text-3xl font-black sm:text-4xl">
              {CLOSING_MESSAGE[0]}
              <br />
              {CLOSING_MESSAGE[1]}
            </p>
            <p className="mt-4 text-sm text-ink-soft">未来の自分に全部送らなくてもいい。</p>
          </div>

          <Disclaimer />
        </motion.div>
      )}

      <FutureMeModal amount={data.amount} open={futureOpen} onClose={closeFuture} />
    </section>
  );
}
