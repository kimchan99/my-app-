import { SHARE_HASHTAG } from "./constants";
import { formatYen } from "./format";

export function buildShareText(amount: number, isGrounded: boolean): string {
  if (isGrounded) {
    return `私は今月、無駄遣い許可が下りなかったらしい。 ${SHARE_HASHTAG}`;
  }
  return `私は今月 ${formatYen(amount)}まで無駄遣いしていいらしい。 ${SHARE_HASHTAG}`;
}

export function getSiteUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

export type ShareOutcome = "shared" | "copied" | "opened" | "failed";

/**
 * Web Share API があればそれを使い、無ければ X の投稿画面を開きつつクリップボードにもコピーする。
 */
export async function shareResult(text: string): Promise<ShareOutcome> {
  const url = getSiteUrl();

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (error) {
      // ユーザーがキャンセルした場合はフォールバックしない
      if (error instanceof DOMException && error.name === "AbortError") {
        return "failed";
      }
    }
  }

  let copied = false;
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    copied = true;
  } catch {
    copied = false;
  }

  const intent = new URL("https://twitter.com/intent/tweet");
  intent.searchParams.set("text", text);
  if (url) intent.searchParams.set("url", url);
  const opened = window.open(intent.toString(), "_blank", "noopener,noreferrer");

  if (opened) return "opened";
  return copied ? "copied" : "failed";
}

/**
 * 画像を保存する。共有シートでファイルが送れる端末（iOS など）は共有シートを、
 * それ以外はダウンロードを使う。
 */
export async function savePermitImage(blob: Blob, fileName: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  return "downloaded";
}
