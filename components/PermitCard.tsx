"use client";

import { motion } from "framer-motion";
import { Stamp } from "./ui/Stamp";
import { FORM_NUMBER, GROUNDED_USES, ISSUER_NAME, ISSUER_NAME_EN, PERMIT_USES } from "@/lib/constants";
import { formatYen } from "@/lib/format";

export interface PermitCardData {
  name: string;
  amount: number;
  isGrounded: boolean;
  serial: string;
  issueDate: string;
  expiryDate: string;
}

interface PermitCardProps {
  data: PermitCardData;
  /** スタンプを押すアニメーションの遅延（秒） */
  stampDelay?: number;
}

export function PermitCard({ data, stampDelay = 0.6 }: PermitCardProps) {
  const uses = data.isGrounded ? GROUNDED_USES : PERMIT_USES;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-[380px] bg-white text-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]"
      aria-label="無駄遣い許可証"
    >
      {/* 二重罫線の枠 */}
      <div className="border-[3px] border-ink p-[3px]">
        <div className="relative border border-ink px-6 pb-7 pt-5">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-ink-soft">
            <span>{FORM_NUMBER}</span>
            <span className="text-ink">{data.serial}</span>
          </div>

          <h3 className="mt-6 text-center font-mincho text-[30px] font-extrabold tracking-[0.22em]">
            無駄遣い許可証
          </h3>
          <p className="mt-1 text-center font-mono text-[9px] tracking-[0.3em] text-ink-soft">
            CERTIFICATE OF PERMITTED WASTE
          </p>

          <div className="mt-5 border-b-2 border-ink pb-2">
            <p className="font-mincho text-2xl font-bold">
              {data.name || "名無しの若者"}
              <span className="ml-2 text-sm font-normal">様</span>
            </p>
          </div>

          <div className="mt-6 space-y-1 font-mincho text-[15px] leading-relaxed">
            {data.isGrounded ? (
              <>
                <p>あなたは未来の自分について</p>
                <p>十分に心配していますが、</p>
                <p>財布の中身も心配です。</p>
                <p className="pt-2">よって今月は、</p>
              </>
            ) : (
              <>
                <p>あなたは未来の自分について</p>
                <p>十分心配しました。</p>
                <p className="pt-2">よって今月、</p>
              </>
            )}
          </div>

          <div className="relative mt-4 border-y border-line py-5">
            {data.isGrounded ? (
              <p className="display text-center font-mincho text-[26px] font-extrabold">
                一旦、おとなしく
                <br />
                してください。
              </p>
            ) : (
              <p className="display text-center font-mono text-[52px] font-semibold tabular-nums tracking-tight">
                {formatYen(data.amount)}
              </p>
            )}

            <div className="pointer-events-none absolute -right-2 -top-6">
              <Stamp
                text={data.isGrounded ? "保留" : "許可"}
                subText={data.isGrounded ? "審査委員会" : "審査委員会"}
                size={104}
                rotate={data.isGrounded ? 10 : -14}
                delay={stampDelay}
              />
            </div>
          </div>

          <div className="mt-4 font-mincho text-[15px] leading-relaxed">
            {data.isGrounded ? (
              <>
                <p>無駄遣いは来月に持ち越しです。</p>
                <p>来月また審査を受けてください。</p>
              </>
            ) : (
              <>
                <p>まで自由に無駄遣いすることを</p>
                <p>許可します。</p>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-ink-soft">
              {data.isGrounded ? "推奨用途（無料）" : "推奨用途"}
            </p>
            <ul className="mt-2 space-y-1 text-[13px]">
              {uses.map((use) => (
                <li key={use} className="flex gap-2">
                  <span className="text-accent" aria-hidden="true">
                    ✓
                  </span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-4 text-[12px]">
            <dt className="font-mono tracking-[0.15em] text-ink-soft">有効期限</dt>
            <dd className="text-right">
              今月末<span className="ml-1 font-mono text-[11px] text-ink-soft">({data.expiryDate})</span>
            </dd>
            <dt className="font-mono tracking-[0.15em] text-ink-soft">発行日</dt>
            <dd className="text-right font-mono text-[11px]">{data.issueDate}</dd>
          </dl>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="font-mincho text-[15px] font-bold tracking-[0.1em]">{ISSUER_NAME}</p>
              <p className="font-mono text-[8px] tracking-[0.2em] text-ink-soft">{ISSUER_NAME_EN}</p>
            </div>
            <Stamp text="委員会印" size={52} rotate={0} animate={false} className="opacity-90" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
