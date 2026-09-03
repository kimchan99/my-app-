import { getRecommendationTier } from "@/lib/calculations";
import { GROUNDED_USES } from "@/lib/constants";
import { formatYen } from "@/lib/format";

interface RecommendationsProps {
  amount: number;
  isGrounded: boolean;
}

export function Recommendations({ amount, isGrounded }: RecommendationsProps) {
  const tier = isGrounded ? null : getRecommendationTier(amount);
  const items = tier ? tier.items : GROUNDED_USES;

  return (
    <section className="border-t-2 border-ink pt-6" aria-labelledby="recommendations-title">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="recommendations-title" className="text-sm font-bold tracking-[0.2em]">
          おすすめ無駄遣い
        </h3>
        <span className="text-right font-mono text-[11px] tracking-[0.15em] text-ink-soft">
          {tier ? `${tier.title} / 〜${formatYen(amount)}` : "予算 ¥0 部門"}
        </span>
      </div>

      <ol className="mt-4 divide-y divide-line border-y border-line">
        {items.map((item, index) => (
          <li key={item} className="flex items-baseline gap-4 py-3">
            <span className="font-mono text-xs tabular-nums tracking-[0.2em] text-accent-deep">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-lg font-bold">{item}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-[11px] text-ink-soft text-pretty">
        ※投資・ギャンブルは推奨用途に含まれません。それは無駄遣いではなく別の何かです。
      </p>
    </section>
  );
}
