import { FORM_NUMBER, ISSUER_NAME } from "@/lib/constants";

interface StepHeaderProps {
  index: number;
  total: number;
  title: string;
  inverted?: boolean;
}

export function StepHeader({ index, total, title, inverted = false }: StepHeaderProps) {
  const soft = inverted ? "text-paper/70" : "text-ink-soft";
  const strong = inverted ? "text-paper" : "text-ink";
  return (
    <header className={`border-b-2 pb-3 ${inverted ? "border-paper" : "border-ink"}`}>
      <div className={`flex items-center justify-between font-mono text-[11px] tracking-[0.18em] ${soft}`}>
        <span>{ISSUER_NAME}</span>
        <span>{FORM_NUMBER}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-4">
        <span className={`font-mono text-sm tabular-nums tracking-[0.2em] ${strong}`}>
          {String(index).padStart(2, "0")}
          <span className={soft}> / {String(total).padStart(2, "0")}</span>
        </span>
        <h2 className={`text-sm font-bold tracking-[0.2em] ${strong}`}>{title}</h2>
      </div>
    </header>
  );
}
