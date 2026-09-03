"use client";

import { motion } from "framer-motion";
import { BearWatermark } from "./ui/BearWatermark";
import { Stamp } from "./ui/Stamp";
import { ISSUER_NAME, PERMIT_DOC } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

export interface PermitCardData {
  name: string;
  age: number;
  amount: number;
  isGrounded: boolean;
  /** 許可番号（数字のみ） */
  permitNumber: string;
  /** 和暦の発行日 */
  issueDate: string;
  /** 和暦の有効期限 */
  expiryDate: string;
}

interface PermitCardProps {
  data: PermitCardData;
  /** 印が押されるアニメーションの遅延（秒） */
  stampDelay?: number;
}

/** 桁数に応じて金額の文字サイズを落とす（PNG 側の fitFontSize と同じ狙い） */
function amountSizeClass(text: string): string {
  if (text.length <= 7) return "text-[56px] sm:text-[64px]";
  if (text.length <= 9) return "text-[44px] sm:text-[52px]";
  return "text-[34px] sm:text-[40px]";
}

/** 脚注の通し番号。許可額をそのまま並べただけの、それっぽい番号 */
export function footerNumber(amount: number): string {
  return `No.${String(Math.max(0, Math.round(amount))).padStart(5, "0")}`;
}

export function PermitCard({ data, stampDelay = 0.6 }: PermitCardProps) {
  const clauses = data.isGrounded ? PERMIT_DOC.clausesGrounded : PERMIT_DOC.clauses;
  const displayName = data.name || "名無しの若者";
  const amountText = formatNumber(data.amount);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-[400px] overflow-hidden bg-form-paper px-5 pb-5 pt-4 font-mincho text-form-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] sm:px-7 sm:pt-6"
      aria-label="無駄遣い許可証"
    >
      {/* 透かし */}
      <BearWatermark className="pointer-events-none absolute left-1/2 top-[38%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-form-mark opacity-60" />

      <div className="relative">
        {/* ヘッダー：左上の小さい印と許可番号 */}
        <div className="flex items-start justify-between">
          <Stamp
            text={data.isGrounded ? PERMIT_DOC.cornerStampGrounded : PERMIT_DOC.cornerStamp}
            variant="seal"
            size={30}
            rotate={0}
            animate={false}
            className="!font-bold"
          />
          <p className="pt-2 text-[10px] tracking-[0.12em] sm:text-[11px]">
            {PERMIT_DOC.numberLabel}
            <span className="ml-3 whitespace-nowrap">第 {data.permitNumber} 号</span>
          </p>
        </div>

        {/* タイトル */}
        <h3 className="mt-5 whitespace-nowrap text-center text-[22px] font-bold tracking-[0.24em] min-[360px]:text-[26px] min-[360px]:tracking-[0.34em] sm:text-[30px]">
          <span className="ml-[0.3em]">無駄遣い許可証</span>
        </h3>

        {/* 氏名・住所 */}
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px] sm:text-[14px]">
          <dt className="tracking-[0.3em] text-form-soft">{PERMIT_DOC.nameLabel}</dt>
          <dd>
            <span className={`font-bold ${displayName.length > 10 ? "text-[11.5px] sm:text-[12.5px]" : ""}`}>
              {displayName}
            </span>
            <span className="whitespace-nowrap">
              <span className="ml-1.5">{PERMIT_DOC.honorific}</span>
              <span className="ml-1">（{data.age}歳）</span>
            </span>
          </dd>
          <dt className="tracking-[0.3em] text-form-soft">{PERMIT_DOC.addressLabel}</dt>
          <dd>{PERMIT_DOC.addressValue}</dd>
        </dl>

        {/* 本文 */}
        <p className="mt-5 text-[12px] leading-relaxed sm:text-[13px]">
          <span className="inline-block w-[1em]" aria-hidden="true" />
          {data.isGrounded ? PERMIT_DOC.bodyGrounded : PERMIT_DOC.body}
        </p>

        {/* 許可額 */}
        <div className="mt-6 text-center">
          <p className="text-[11px] tracking-[0.2em] text-form-soft">{PERMIT_DOC.amountLabel}</p>
          <p className="mt-1 whitespace-nowrap leading-none">
            <span className={`font-extrabold tabular-nums tracking-[0.02em] ${amountSizeClass(amountText)}`}>
              {amountText}
            </span>
            <span className="ml-1 text-[20px] font-bold">円</span>
          </p>
          <p className="mt-2 text-[10px] leading-snug tracking-[0.04em] text-form-soft text-balance sm:text-[10.5px]">
            {data.isGrounded ? PERMIT_DOC.amountNoteGrounded : PERMIT_DOC.amountNote}
          </p>
        </div>

        {/* 日付と局長印 */}
        <div className="mt-7 flex flex-wrap items-end justify-between gap-x-2 gap-y-3">
          <dl className="grid grid-cols-[auto_auto] gap-x-2.5 gap-y-1.5 whitespace-nowrap text-[10.5px] sm:gap-x-4 sm:text-[12px]">
            <dt className="tracking-[0.04em] text-form-soft sm:tracking-[0.08em]">{PERMIT_DOC.issuedLabel}</dt>
            <dd>{data.issueDate}</dd>
            <dt className="tracking-[0.04em] text-form-soft sm:tracking-[0.08em]">{PERMIT_DOC.expiresLabel}</dt>
            <dd>{data.expiryDate}</dd>
          </dl>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <p className="whitespace-nowrap text-right leading-tight">
              <span className="block text-[9px] tracking-[0.06em] text-form-soft sm:text-[9.5px] sm:tracking-[0.1em]">
                {PERMIT_DOC.chiefLabel}
              </span>
              <span className="block text-[14px] font-bold tracking-[0.04em] sm:text-[17px] sm:tracking-[0.06em]">
                {PERMIT_DOC.chiefName}
              </span>
            </p>
            <Stamp text={PERMIT_DOC.sealText} variant="seal" size={50} rotate={-6} delay={stampDelay} />
          </div>
        </div>

        <hr className="mt-5 border-0 border-t border-form-line" />

        {/* 条文 */}
        <ol className="mt-4 space-y-3 text-[10.5px] leading-relaxed sm:text-[11.5px]">
          {clauses.map((clause, index) => (
            <li key={clause.title} className="grid grid-cols-[1.4em_1fr]">
              <span className="font-bold">{index + 1}.</span>
              <div>
                <p className="font-bold">{clause.title}</p>
                <p className="mt-0.5 text-form-soft">{clause.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* フッター */}
        <div className="mt-8 flex items-end justify-between gap-4 text-[9px] leading-relaxed text-form-soft sm:text-[9.5px]">
          <p className="text-pretty">
            {PERMIT_DOC.footer}
            <br />
            <span className="tracking-[0.15em]">{ISSUER_NAME}</span>
          </p>
          <p className="whitespace-nowrap tracking-[0.08em]">{footerNumber(data.amount)}</p>
        </div>
      </div>
    </motion.article>
  );
}
