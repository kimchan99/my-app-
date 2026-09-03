import { FORM_NUMBER, GROUNDED_USES, ISSUER_NAME, ISSUER_NAME_EN, PERMIT_USES } from "./constants";
import { formatYen } from "./format";

export interface PermitImageData {
  name: string;
  amount: number;
  isGrounded: boolean;
  serial: string;
  issueDate: string;
  expiryDate: string;
}

export interface PermitImageFonts {
  sans: string;
  mincho: string;
  mono: string;
}

const WIDTH = 1080;
const HEIGHT = 1620;
const INK = "#111111";
const SOFT = "#55554f";
const LINE = "#d9d7cf";
const ACCENT = "#e1352c";

function font(weight: number | string, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

async function ensureFonts(fonts: PermitImageFonts): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const specs = [
    font(700, 40, fonts.sans),
    font(400, 40, fonts.mincho),
    font(700, 40, fonts.mincho),
    font(800, 40, fonts.mincho),
    font(400, 40, fonts.mono),
    font(600, 40, fonts.mono),
  ];
  await Promise.all(
    specs.map((spec) =>
      document.fonts.load(spec, "無駄遣い許可証 ¥0123456789").catch(() => undefined),
    ),
  );
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, weight: number, startSize: number, family: string): number {
  let size = startSize;
  ctx.font = font(weight, size, family);
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = font(weight, size, family);
  }
  return size;
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  text: string,
  subText: string,
  rotateDeg: number,
  family: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = ACCENT;
  ctx.fillStyle = ACCENT;

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.84, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(800, radius * 0.17, family);
  ctx.fillText(subText, 0, -radius * 0.42);
  ctx.font = font(800, radius * (text.length > 2 ? 0.34 : 0.62), family);
  ctx.fillText(text, 0, radius * (text.length > 2 ? 0.02 : 0.08));
  ctx.restore();
}

function drawCheck(ctx: CanvasRenderingContext2D, x: number, y: number, family: string) {
  ctx.fillStyle = ACCENT;
  ctx.font = font(700, 30, family);
  ctx.textAlign = "left";
  ctx.fillText("✓", x, y);
}

/**
 * 許可証を縦長PNG（1080×1620）として描画する。
 */
export async function renderPermitImage(data: PermitImageData, fonts: PermitImageFonts): Promise<Blob> {
  await ensureFonts(fonts);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");

  // 背景（紙）
  ctx.fillStyle = "#f7f6f2";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // カード
  const cardX = 90;
  const cardY = 90;
  const cardW = WIDTH - cardX * 2;
  const cardH = HEIGHT - cardY * 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cardX, cardY, cardW, cardH);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.strokeRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8);
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX + 18, cardY + 18, cardW - 36, cardH - 36);

  const left = cardX + 64;
  const right = cardX + cardW - 64;
  const contentW = right - left;
  let y = cardY + 76;

  // ヘッダー
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 22, fonts.mono);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(FORM_NUMBER, left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.fillText(data.serial, right, y);

  // タイトル
  y += 108;
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = font(800, 76, fonts.mincho);
  ctx.save();
  ctx.letterSpacing = "14px";
  ctx.fillText("無駄遣い許可証", WIDTH / 2 + 7, y);
  ctx.restore();

  y += 38;
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 20, fonts.mono);
  ctx.save();
  ctx.letterSpacing = "6px";
  ctx.fillText("CERTIFICATE OF PERMITTED WASTE", WIDTH / 2 + 3, y);
  ctx.restore();

  // 名前
  y += 84;
  const name = data.name || "名無しの若者";
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  const nameSize = fitText(ctx, name, contentW - 90, 700, 56, fonts.mincho);
  ctx.font = font(700, nameSize, fonts.mincho);
  ctx.fillText(name, left, y);
  const nameWidth = ctx.measureText(name).width;
  ctx.font = font(400, 28, fonts.mincho);
  ctx.fillText("様", left + nameWidth + 20, y);
  y += 20;
  ctx.fillStyle = INK;
  ctx.fillRect(left, y, contentW, 4);

  // 本文
  y += 64;
  ctx.font = font(400, 32, fonts.mincho);
  ctx.fillStyle = INK;
  const intro = data.isGrounded
    ? ["あなたは未来の自分について", "十分に心配していますが、", "財布の中身も心配です。", "", "よって今月は、"]
    : ["あなたは未来の自分について", "十分心配しました。", "", "よって今月、"];
  for (const lineText of intro) {
    if (lineText) ctx.fillText(lineText, left, y);
    y += lineText ? 46 : 18;
  }

  // 金額ブロック
  y += 16;
  ctx.fillStyle = LINE;
  ctx.fillRect(left, y, contentW, 2);
  const amountTop = y;
  y += 104;
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  if (data.isGrounded) {
    ctx.font = font(800, 56, fonts.mincho);
    ctx.fillText("一旦、おとなしく", WIDTH / 2, y - 4);
    ctx.fillText("してください。", WIDTH / 2, y + 56);
    y += 64;
  } else {
    const amountText = formatYen(data.amount);
    const amountSize = fitText(ctx, amountText, contentW - 40, 600, 118, fonts.mono);
    ctx.font = font(600, amountSize, fonts.mono);
    ctx.fillText(amountText, WIDTH / 2, y);
  }
  y += 40;
  ctx.fillStyle = LINE;
  ctx.fillRect(left, y, contentW, 2);

  // 判子
  drawStamp(
    ctx,
    right - 92,
    amountTop - 44,
    115,
    data.isGrounded ? "保留" : "許可",
    "審査委員会",
    data.isGrounded ? 10 : -14,
    fonts.mincho,
  );

  // 本文つづき
  y += 58;
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = font(400, 32, fonts.mincho);
  const outro = data.isGrounded
    ? ["無駄遣いは来月に持ち越しです。", "来月また審査を受けてください。"]
    : ["まで自由に無駄遣いすることを", "許可します。"];
  for (const lineText of outro) {
    ctx.fillText(lineText, left, y);
    y += 46;
  }

  // 推奨用途
  y += 26;
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 20, fonts.mono);
  ctx.save();
  ctx.letterSpacing = "5px";
  ctx.fillText(data.isGrounded ? "推奨用途（無料）" : "推奨用途", left, y);
  ctx.restore();
  y += 40;
  const uses = data.isGrounded ? GROUNDED_USES : PERMIT_USES;
  for (const use of uses) {
    drawCheck(ctx, left, y, fonts.sans);
    ctx.fillStyle = INK;
    ctx.font = font(400, 27, fonts.sans);
    ctx.fillText(use, left + 40, y);
    y += 38;
  }

  // 期限
  y += 18;
  ctx.fillStyle = LINE;
  ctx.fillRect(left, y, contentW, 2);
  y += 42;
  ctx.font = font(400, 22, fonts.mono);
  ctx.fillStyle = SOFT;
  ctx.textAlign = "left";
  ctx.fillText("有効期限", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = font(400, 24, fonts.sans);
  ctx.fillText(`今月末（${data.expiryDate}）`, right, y);
  y += 36;
  ctx.textAlign = "left";
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 22, fonts.mono);
  ctx.fillText("発行日", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.fillText(data.issueDate, right, y);

  // 発行者
  const footerY = cardY + cardH - 80;
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = font(700, 30, fonts.mincho);
  ctx.fillText(ISSUER_NAME, left, footerY);
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 16, fonts.mono);
  ctx.save();
  ctx.letterSpacing = "3px";
  ctx.fillText(ISSUER_NAME_EN, left, footerY + 30);
  ctx.restore();
  drawStamp(ctx, right - 56, footerY - 8, 54, "委員会印", "", 0, fonts.mincho);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("failed to render image"));
    }, "image/png");
  });
}
