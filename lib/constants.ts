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

export const JUDGING_DURATION_MS = 2000;
export const JUDGING_MESSAGE_INTERVAL_MS = 550;

export const JUDGING_MESSAGES = [
  "老後のあなたと協議中",
  "通帳を勝手に眺めています",
  "無駄遣いの正当化をしています",
  "未来のあなたから苦情が来ています",
  "先月のコンビニ代を見なかったことにしています",
  "委員会の判子を探しています",
  "税理士っぽい人に聞いています",
  "「まあいっか」を数えています",
];

/** 「このお金、使わない」演出の各段階の表示タイミング（ms） */
export const FUTURE_ME_STAGE_TIMINGS_MS = [0, 1000, 2200, 4200, 5800, 6800];

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

/** 許可証の本文・条文（公文書っぽい形式） */
export const PERMIT_DOC = {
  numberLabel: "許可番号",
  nameLabel: "氏　名",
  honorific: "さん",
  addressLabel: "住　所",
  addressValue: "現在（老後よりも、いま）",
  body: "上記の者は、将来に必要なお金を残したうえで、下記の金額まで無駄遣いをしてよい者であることを証する。",
  bodyGrounded: "上記の者は、将来に必要なお金を残す前に、まず今月を乗り切るべき者であることを証する。",
  amountLabel: "今月の無駄遣い許可額",
  amountNote: "旅行・ちょっと高いご飯・趣味・必要ではないけど欲しいものに限る（限らない）",
  amountNoteGrounded: "散歩・図書館・友達の家・水道水に限る（無料のものは無制限）",
  issuedLabel: "許可の年月日",
  expiresLabel: "許可の有効期限",
  chiefLabel: "無駄遣い許可局長",
  chiefName: "未来のわたし",
  sealText: "無駄遣印",
  cornerStamp: "許可",
  cornerStampGrounded: "保留",
  clauses: [
    {
      title: "許可される無駄遣いの範囲",
      body: `${PERMIT_USES.join("、")}、友達との時間（以上、若い今だからこそ価値が高いもの）`,
    },
    {
      title: "許可の条件",
      body: "老後のために貯めすぎないこと。未来の自分に全部送金しないこと。",
    },
    {
      title: "備考",
      body: "「老後のあなた、ちょっと金持ちすぎません？」",
    },
    {
      title: "許可の更新",
      body: "毎月1日に自動更新。金額は収入・生活費・貯金額・老後へのビビり具合により変動する。",
    },
  ],
  clausesGrounded: [
    {
      title: "許可される無駄遣いの範囲",
      body: `${GROUNDED_USES.join("、")}、水道水（以上、無料または実質無料のもの）`,
    },
    {
      title: "保留の条件",
      body: "生活費が収入を上回っている、または貯金がまだ心もとないため。あなたが悪いわけではない。",
    },
    {
      title: "備考",
      body: "無駄遣いは逃げない。来月また来ること。",
    },
    {
      title: "許可の更新",
      body: "毎月1日に自動更新。来月また審査を受けてください。",
    },
  ],
  footer: "本証は「今の100万円」と「老後の100万円」は同じ価値ではない、という考えに基づき発行されています。",
} as const;

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
  "※許可証に法的効力はありません。たぶん。",
  "※本委員会は実在しません。",
];

/** ヒーロー下部の電光掲示板 */
export const MARQUEE_ITEMS = [
  "無駄遣い審査 受付中",
  "本日の許可率 98.2%",
  "審査時間 約2秒",
  "手数料 無料",
  "不服申し立て 不可",
];

/** 不許可（0円）時の結果見出しの前置き */
export const GROUNDED_LEAD_IN = "審査の結果、";

export const CLOSING_MESSAGE = ["老後も大事。", "今もまあまあ大事。"];
export const CLOSING_SUB_MESSAGE = "未来の自分に全部送らなくてもいい。";

export const DISCLAIMER_TEXT =
  "このサイトは娯楽目的の簡易シミュレーションです。特定の金融商品の購入・投資・支出を推奨するものではありません。";

export const INFLATION_DISCLAIMER_TEXT =
  "年2％のインフレを仮定した単純計算です。将来の物価を保証するものではありません。";

export const SHARE_HASHTAG = "#無駄遣い許可証";

export const STORAGE_KEY = "waste-permit:v1";
