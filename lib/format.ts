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

/** 今月末の日付ラベル（例: 2026年9月30日） */
export function endOfMonthLabel(date: Date = new Date()): string {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
}

/** 発行日ラベル（例: 2026年9月3日） */
export function issueDateLabel(date: Date = new Date()): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 許可証番号っぽい文字列（例: 第2609-4821号） */
export function generateSerial(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10_000)).padStart(4, "0");
  return `第${yy}${mm}-${rand}号`;
}
