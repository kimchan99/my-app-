const yenFormatter = new Intl.NumberFormat("ja-JP");

/** 38400 → "38,400" */
export function formatNumber(value: number): string {
  return yenFormatter.format(Math.round(value));
}

/** 38400 → "¥38,400" */
export function formatYen(value: number): string {
  return `¥${formatNumber(value)}`;
}

/** 460000 → "約46万円" */
export function formatManYen(value: number): string {
  const man = Math.round(value / 10_000);
  return `約${man}万円`;
}

/**
 * ユーザー入力（"350,000" / "３５００００" / "35万" などは非対応）を数値に変換する。
 * 数字以外は捨てる。空なら null。
 */
export function parseYenInput(raw: string, max: number): number | null {
  const normalized = raw.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
  const digits = normalized.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(parsed, max);
}

/** 和暦ラベル（例: 令和8年9月3日）。2019年より前は西暦のまま */
export function warekiLabel(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (y >= 2019) {
    const n = y - 2018;
    return `令和${n === 1 ? "元" : n}年${m}月${d}日`;
  }
  return `${y}年${m}月${d}日`;
}

/** 今月末の日付 */
export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 許可番号（例: 第2026090338420号）。
 * 発行日 YYYYMMDD ＋ 許可額 を並べただけの、それっぽい番号。
 */
export function generatePermitNumber(date: Date, amount: number): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const tail = String(Math.max(0, Math.round(amount))).padStart(5, "0");
  return `${yyyy}${mm}${dd}${tail}`;
}
