import { ISSUER_NAME, PERMIT_DOC } from "./constants";
import { formatNumber } from "./format";

export interface PermitImageData {
  name: string;
  age: number;
  amount: number;
  isGrounded: boolean;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface PermitImageFonts {
  sans: string;
  mincho: string;
  mono: string;
}

const WIDTH = 1080;
const HEIGHT = 1600;

const PAPER = "#d9e5ef";
const INK = "#1c2b39";
const SOFT = "#4a5b6a";
const LINE = "#93a9bb";
const MARK = "#8db0cc";
const RED = "#e1352c";

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function font(weight: number | string, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

/** next/font が返す "'A', 'A Fallback'" から先頭のファミリーだけを取り出す */
function primaryFamily(list: string): string {
  return list.split(",")[0].trim();
}

/** 脚注の通し番号（PermitCard.tsx と同じ形式） */
function footerNumber(amount: number): string {
  return `No.${String(Math.max(0, Math.round(amount))).padStart(5, "0")}`;
}

/** 描画する全文字列を集めて、必要なフォントのスライスをすべて読み込む */
async function ensureFonts(fonts: PermitImageFonts, data: PermitImageData): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const clauses = data.isGrounded ? PERMIT_DOC.clausesGrounded : PERMIT_DOC.clauses;
  const sample = [
    PERMIT_DOC.numberLabel,
    `第 ${data.permitNumber} 号`,
    "無駄遣い許可証",
    PERMIT_DOC.nameLabel,
    PERMIT_DOC.addressLabel,
    PERMIT_DOC.addressValue,
    data.name || "名無しの若者",
    `${PERMIT_DOC.honorific}（${data.age}歳）`,
    data.isGrounded ? PERMIT_DOC.bodyGrounded : PERMIT_DOC.body,
    PERMIT_DOC.amountLabel,
    formatNumber(data.amount),
    "円",
    data.isGrounded ? PERMIT_DOC.amountNoteGrounded : PERMIT_DOC.amountNote,
    PERMIT_DOC.issuedLabel,
    PERMIT_DOC.expiresLabel,
    data.issueDate,
    data.expiryDate,
    PERMIT_DOC.chiefLabel,
    PERMIT_DOC.chiefName,
    PERMIT_DOC.sealText,
    PERMIT_DOC.cornerStamp,
    PERMIT_DOC.cornerStampGrounded,
    ...clauses.flatMap((c) => [c.title, c.body]),
    "1.2.3.4.",
    PERMIT_DOC.footer,
    ISSUER_NAME,
    footerNumber(data.amount),
  ].join("");

  const mincho = primaryFamily(fonts.mincho);
  const sans = primaryFamily(fonts.sans);
  const specs = [
    font(400, 40, mincho),
    font(700, 40, mincho),
    font(800, 40, mincho),
    font(400, 40, sans),
  ];
  await Promise.all(specs.map((spec) => document.fonts.load(spec, sample).catch(() => undefined)));
  try {
    await document.fonts.ready;
  } catch {
    /* 読み込みに失敗してもフォールバックフォントで描く */
  }
}

/** 日本語向けの簡易折り返し（行頭禁則だけ考慮） */
function wrapText(ctx: Ctx, text: string, maxWidth: number, firstLineIndent = 0): string[] {
  const noHead = "、。，．）」』】〕〉》・ー";
  const lines: string[] = [];
  let line = "";
  let width = firstLineIndent;
  for (const ch of Array.from(text)) {
    const w = ctx.measureText(ch).width;
    if (width + w > maxWidth && line !== "" && !noHead.includes(ch)) {
      lines.push(line);
      line = "";
      width = 0;
    }
    line += ch;
    width += w;
  }
  if (line) lines.push(line);
  return lines;
}

function fitFontSize(
  ctx: Ctx,
  text: string,
  maxWidth: number,
  weight: number,
  startSize: number,
  family: string,
  minSize = 20,
): number {
  let size = startSize;
  ctx.font = font(weight, size, family);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = font(weight, size, family);
  }
  return size;
}

/**
 * 字間を空けて中央／左寄せで描く。letterSpacing 非対応ブラウザでは 1 文字ずつ描く。
 */
function drawSpaced(ctx: Ctx, text: string, x: number, y: number, spacing: number, align: "left" | "center") {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cursor = align === "center" ? x - total / 2 : x;
  ctx.save();
  ctx.textAlign = "left";
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i] + spacing;
  });
  ctx.restore();
}

/** 正方形の印鑑。2文字なら縦1列、4文字なら右→左の2列で描く（Stamp.tsx と同じ比率） */
function drawSeal(ctx: Ctx, cx: number, cy: number, size: number, text: string, rotateDeg: number, family: string, lineWidth = 5) {
  const chars = Array.from(text);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = RED;
  ctx.fillStyle = RED;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(800, size * 0.36, family);
  if (chars.length <= 2) {
    const pitch = size * 0.36 * 1.1;
    chars.forEach((ch, i) => ctx.fillText(ch, 0, (i - (chars.length - 1) / 2) * pitch));
  } else {
    const col = size * 0.22;
    const row = size * 0.21;
    const positions = [
      [col, -row],
      [col, row],
      [-col, -row],
      [-col, row],
    ];
    chars.slice(0, 4).forEach((ch, i) => ctx.fillText(ch, positions[i][0], positions[i][1]));
  }
  ctx.restore();
}

/** 透かしのクマ（BearWatermark.tsx と同じ形） */
function drawBear(ctx: Ctx, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx - 100 * scale, cy - 115 * scale);
  ctx.scale(scale, scale);
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const circle = (x: number, y: number, r: number, fill = false) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) ctx.fill();
    else ctx.stroke();
  };
  const ellipse = (x: number, y: number, rx: number, ry: number, fill = false) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) ctx.fill();
    else ctx.stroke();
  };

  circle(52, 48, 20);
  circle(148, 48, 20);
  circle(52, 48, 9);
  circle(148, 48, 9);
  circle(100, 82, 54);
  ellipse(100, 100, 22, 15);
  ellipse(100, 93, 7, 4.5, true);
  circle(78, 76, 3.5, true);
  circle(122, 76, 3.5, true);

  ctx.beginPath();
  ctx.moveTo(62, 132);
  ctx.bezierCurveTo(48, 150, 44, 190, 58, 212);
  ctx.bezierCurveTo(72, 226, 128, 226, 142, 212);
  ctx.bezierCurveTo(156, 190, 152, 150, 138, 132);
  ctx.stroke();
  ellipse(100, 176, 26, 30);

  ctx.beginPath();
  ctx.moveTo(62, 140);
  ctx.bezierCurveTo(40, 150, 30, 170, 38, 186);
  ctx.bezierCurveTo(46, 198, 62, 190, 70, 176);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(138, 140);
  ctx.bezierCurveTo(160, 150, 170, 170, 162, 186);
  ctx.bezierCurveTo(154, 198, 138, 190, 130, 176);
  ctx.stroke();

  ctx.restore();
}

/**
 * 許可証を縦長PNG（1080×1600）として描画する。PermitCard.tsx と同じ構成。
 */
export async function renderPermitImage(data: PermitImageData, fonts: PermitImageFonts): Promise<Blob> {
  await ensureFonts(fonts, data);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d") as Ctx | null;
  if (!ctx) throw new Error("canvas not supported");

  const mincho = fonts.mincho;
  const left = 96;
  const right = WIDTH - 96;
  const contentW = right - left;

  // 用紙
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawBear(ctx, WIDTH / 2, 600, 4.2);

  ctx.textBaseline = "alphabetic";

  // 左上の印と許可番号
  drawSeal(ctx, left + 34, 118, 68, data.isGrounded ? PERMIT_DOC.cornerStampGrounded : PERMIT_DOC.cornerStamp, 0, mincho, 7);
  ctx.fillStyle = INK;
  ctx.font = font(400, 24, mincho);
  ctx.textAlign = "right";
  ctx.fillText(`${PERMIT_DOC.numberLabel}　第 ${data.permitNumber} 号`, right, 126);

  // タイトル
  ctx.fillStyle = INK;
  ctx.font = font(700, 72, mincho);
  drawSpaced(ctx, "無駄遣い許可証", WIDTH / 2, 262, 24, "center");

  // 氏名・住所
  let y = 362;
  const valueX = left + 190;
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 28, mincho);
  drawSpaced(ctx, PERMIT_DOC.nameLabel, left, y, 10, "left");
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  const displayName = data.name || "名無しの若者";
  const nameSize = fitFontSize(ctx, displayName, 420, 700, 32, mincho, 22);
  ctx.font = font(700, nameSize, mincho);
  ctx.fillText(displayName, valueX, y);
  const nameW = ctx.measureText(displayName).width;
  ctx.font = font(400, 28, mincho);
  ctx.fillText(`${PERMIT_DOC.honorific}（${data.age}歳）`, valueX + nameW + 12, y);

  y += 62;
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 28, mincho);
  drawSpaced(ctx, PERMIT_DOC.addressLabel, left, y, 10, "left");
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.fillText(PERMIT_DOC.addressValue, valueX, y);

  // 本文
  y += 76;
  ctx.font = font(400, 26, mincho);
  ctx.fillStyle = INK;
  const bodyLines = wrapText(ctx, data.isGrounded ? PERMIT_DOC.bodyGrounded : PERMIT_DOC.body, contentW, 26);
  bodyLines.forEach((line, i) => {
    ctx.fillText(line, left + (i === 0 ? 26 : 0), y);
    y += 42;
  });

  // 許可額
  y += 54;
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 24, mincho);
  drawSpaced(ctx, PERMIT_DOC.amountLabel, WIDTH / 2, y, 6, "center");

  y += 140;
  const amountText = formatNumber(data.amount);
  const amountSize = fitFontSize(ctx, amountText, contentW - 120, 800, 150, mincho, 80);
  ctx.font = font(800, amountSize, mincho);
  const amountW = ctx.measureText(amountText).width;
  ctx.font = font(700, 44, mincho);
  const yenW = ctx.measureText("円").width;
  const totalW = amountW + 14 + yenW;
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = font(800, amountSize, mincho);
  ctx.fillText(amountText, WIDTH / 2 - totalW / 2, y);
  ctx.font = font(700, 44, mincho);
  ctx.fillText("円", WIDTH / 2 - totalW / 2 + amountW + 14, y);

  y += 46;
  ctx.textAlign = "center";
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 21, mincho);
  const noteLines = wrapText(ctx, data.isGrounded ? PERMIT_DOC.amountNoteGrounded : PERMIT_DOC.amountNote, contentW);
  noteLines.forEach((line) => {
    ctx.fillText(line, WIDTH / 2, y);
    y += 32;
  });

  // 日付と局長印
  y += 70;
  const datesTop = y;
  ctx.textAlign = "left";
  ctx.font = font(400, 24, mincho);
  ctx.fillStyle = SOFT;
  ctx.fillText(PERMIT_DOC.issuedLabel, left, y);
  ctx.fillStyle = INK;
  ctx.fillText(data.issueDate, left + 210, y);
  y += 44;
  ctx.fillStyle = SOFT;
  ctx.fillText(PERMIT_DOC.expiresLabel, left, y);
  ctx.fillStyle = INK;
  ctx.fillText(data.expiryDate, left + 210, y);

  const sealSize = 118;
  const sealCx = right - sealSize / 2 - 4;
  const sealCy = datesTop + 6;
  ctx.textAlign = "right";
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 20, mincho);
  ctx.fillText(PERMIT_DOC.chiefLabel, sealCx - sealSize / 2 - 26, datesTop - 22);
  ctx.fillStyle = INK;
  ctx.font = font(700, 36, mincho);
  ctx.fillText(PERMIT_DOC.chiefName, sealCx - sealSize / 2 - 26, datesTop + 22);
  drawSeal(ctx, sealCx, sealCy, sealSize, PERMIT_DOC.sealText, -6, mincho, 6);

  // 罫線
  y += 52;
  ctx.fillStyle = LINE;
  ctx.fillRect(left, y, contentW, 2);

  // 条文（フッターに衝突するなら文字を小さくして詰める）
  y += 56;
  const clauses = data.isGrounded ? PERMIT_DOC.clausesGrounded : PERMIT_DOC.clauses;
  const clauseIndent = 40;
  const footerTop = HEIGHT - 150;
  const layouts = [
    { title: 23, body: 21, titleGap: 34, lineGap: 31, gap: 16 },
    { title: 21, body: 19, titleGap: 30, lineGap: 27, gap: 12 },
    { title: 19, body: 17, titleGap: 26, lineGap: 24, gap: 8 },
  ];
  const measure = (layout: (typeof layouts)[number]) => {
    let total = 0;
    for (const clause of clauses) {
      ctx.font = font(400, layout.body, mincho);
      const lines = wrapText(ctx, clause.body, contentW - clauseIndent).length;
      total += layout.titleGap + lines * layout.lineGap + layout.gap;
    }
    return total;
  };
  const layout = layouts.find((l) => y + measure(l) <= footerTop) ?? layouts[layouts.length - 1];
  clauses.forEach((clause, index) => {
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = font(700, layout.title, mincho);
    ctx.fillText(`${index + 1}.`, left, y);
    ctx.fillText(clause.title, left + clauseIndent, y);
    y += layout.titleGap;
    ctx.fillStyle = SOFT;
    ctx.font = font(400, layout.body, mincho);
    const lines = wrapText(ctx, clause.body, contentW - clauseIndent);
    lines.forEach((line) => {
      ctx.fillText(line, left + clauseIndent, y);
      y += layout.lineGap;
    });
    y += layout.gap;
  });

  // フッター
  const footerY = HEIGHT - 96;
  ctx.textAlign = "left";
  ctx.fillStyle = SOFT;
  ctx.font = font(400, 17, mincho);
  const footerLines = wrapText(ctx, PERMIT_DOC.footer, contentW - 200);
  let fy = footerY - (footerLines.length - 1) * 26;
  footerLines.forEach((line) => {
    ctx.fillText(line, left, fy);
    fy += 26;
  });
  drawSpaced(ctx, ISSUER_NAME, left, fy, 3, "left");
  ctx.textAlign = "right";
  ctx.font = font(400, 18, mincho);
  ctx.fillText(footerNumber(data.amount), right, footerY);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("failed to render image"));
    }, "image/png");
  });
}
