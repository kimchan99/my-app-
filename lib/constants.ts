/**
 * サイト全体の計算・演出用の定数。
 * ロジックを変えたいときは基本的にこのファイルだけを触れば済むようにしている。
 */

/* ---------- 年齢・インフレ ---------- */

export const DEFAULT_AGE = 26;
export const RETIREMENT_AGE = 65;
export const MIN_AGE = 15;
export const MAX_AGE = 100;

/** 年間インフレ率（仮定） */
export const INFLATION_RATE = 0.02;

/** 「100万円の価値」で使う基準額 */
export const REFERENCE_AMOUNT = 1_000_000;

/* ---------- 無駄遣い審査 ---------- */

export type FearLevel = 1 | 2 | 3 | 4 | 5;

export const PERMIT_RULES = {
  /** 毎月の余剰のうち、無駄遣いに回してよい割合 */
  SURPLUS_RATE: 0.3,
  /** 生活防衛資金として確保しておく生活費の月数 */
  EMERGENCY_FUND_MONTHS: 6,
  /** 余剰貯金を何ヶ月に分割してボーナスにするか */
  SAVINGS_BONUS_MONTHS: 24,
  /** 上限：手取り月収に対する割合 */
  INCOME_CAP_RATE: 0.25,
  /** 丸め単位（円） */
  ROUNDING_UNIT: 100,
} as const;

export const FEAR_MULTIPLIERS: Record<FearLevel, number> = {
  1: 1.2,
  2: 1.1,
  3: 1.0,
  4: 0.9,
  5: 0.8,
};

export const FEAR_LEVELS: {
  level: FearLevel;
  emoji: string;
  label: string;
}[] = [
  { level: 1, emoji: "😎", label: "全然平気" },
  { level: 2, emoji: "🙂", label: "まあ大丈夫" },
  { level: 3, emoji: "😐", label: "ふつうに不安" },
  { level: 4, emoji: "😰", label: "けっこう怖い" },
  { level: 5, emoji: "😭", label: "めちゃ怖い" },
];

/** 入力の上限（桁あふれ防止） */
export const MAX_YEN_INPUT = 999_999_999;

/* ---------- 演出 ---------- */

export const JUDGING_DURATION_MS = 2400;
export const JUDGING_MESSAGE_INTERVAL_MS = 650;

export const JUDGING_MESSAGES = [
  "老後のあなたと協議中",
  "通帳を勝手に眺めています",
  "無駄遣いの正当化をしています",
  "未来のあなたから苦情が来ています",
  "先月のコンビニ支出を見なかったことにしています",
  "委員会の判子を探しています",
  "税理士っぽい人に聞いています",
  "「まあいっか」を数えています",
];

/* ---------- 許可証 ---------- */

export const ISSUER_NAME = "若者無駄遣い審査委員会";
export const ISSUER_NAME_EN = "YOUTH WASTEFUL SPENDING REVIEW BOARD";
export const FORM_NUMBER = "様式第1号";

/** 許可証カードに載せる推奨用途 */
export const PERMIT_USES = [
  "旅行",
  "ちょっと高いご飯",
  "趣味",
  "必要ではないけど欲しいもの",
  "後から「なんで買ったんだろ」と思うもの",
];

/** 0円判定のときの推奨用途 */
export const GROUNDED_USES = [
  "散歩（無料）",
  "図書館（無料）",
  "友達の家（実質無料）",
  "来月への期待",
];

export const GROUNDED_MESSAGE = "今月は一旦、おとなしくしてください。";

/* ---------- おすすめ無駄遣い ---------- */

export interface RecommendationTier {
  /** この金額以下ならこのティア（最後は Infinity） */
  maxAmount: number;
  title: string;
  items: string[];
}

export const RECOMMENDATION_TIERS: RecommendationTier[] = [
  {
    maxAmount: 5_000,
    title: "ささやかな無駄",
    items: ["ちょっと高いランチ", "映画", "意味なくタクシー", "コンビニでいちばん高いアイス"],
  },
  {
    maxAmount: 20_000,
    title: "ほどよい無駄",
    items: ["良い寿司", "服", "日帰り旅行", "ライブ"],
  },
  {
    maxAmount: 50_000,
    title: "しっかりした無駄",
    items: ["韓国旅行", "ちょっと良いホテル", "趣味の道具", "ずっと欲しかったもの"],
  },
  {
    maxAmount: Infinity,
    title: "立派な無駄",
    items: ["旅行", "新しい趣味", "友達との思い出", "ずっとやりたかったこと"],
  },
];

/* ---------- コピー ---------- */

export const HERO_NOTES = [
  "※家賃滞納は無駄遣いに含まれません。",
  "※審査は約2秒で終わります。",
  "※本委員会は実在しません。",
];

export const CLOSING_MESSAGE = ["老後も大事。", "今もまあまあ大事。"];

export const DISCLAIMER_TEXT =
  "このサイトは娯楽目的の簡易シミュレーションです。特定の金融商品の購入・投資・支出を推奨するものではありません。";

export const INFLATION_DISCLAIMER_TEXT =
  "年2％のインフレを仮定した単純計算です。将来の物価を保証するものではありません。";

export const SHARE_HASHTAG = "#無駄遣い許可証";

export const STORAGE_KEY = "waste-permit:v1";
