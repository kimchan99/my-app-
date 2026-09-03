import { DISCLAIMER_TEXT, INFLATION_DISCLAIMER_TEXT, ISSUER_NAME } from "@/lib/constants";

export function Disclaimer() {
  return (
    <footer className="border-t border-line pt-6 text-[11px] leading-relaxed text-ink-soft">
      <p>{DISCLAIMER_TEXT}</p>
      <p className="mt-2">{INFLATION_DISCLAIMER_TEXT}</p>
      <p className="mt-2">入力した数値はブラウザ内でのみ処理され、サーバーには送信されません。</p>
      <p className="mt-6 font-mono text-[10px] tracking-[0.2em]">{ISSUER_NAME}（実在しません）</p>
    </footer>
  );
}
