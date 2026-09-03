import {
  FEAR_MULTIPLIERS,
  INFLATION_RATE,
  PERMIT_RULES,
  RECOMMENDATION_TIERS,
  REFERENCE_AMOUNT,
  RETIREMENT_AGE,
  type FearLevel,
  type RecommendationTier,
} from "./constants";

/* ---------- 100万円の価値 ---------- */

export function yearsUntilRetirement(age: number): number {
  return Math.max(0, RETIREMENT_AGE - Math.floor(age));
}

/**
 * 将来（老後年齢時点）の金額を、現在の購買力に換算する。
 * presentValue = amount / (1 + inflationRate) ^ years
 */
export function presentValueOfFutureMoney(
  age: number,
  amount: number = REFERENCE_AMOUNT,
  inflationRate: number = INFLATION_RATE,
): number {
  const years = yearsUntilRetirement(age);
  return amount / Math.pow(1 + inflationRate, years);
}

/** 表示用に1万円単位へ丸める（例: 462,970 → 460,000） */
export function roundToTenThousand(value: number): number {
  return Math.round(value / 10_000) * 10_000;
}

/* ---------- 無駄遣い審査 ---------- */

export interface PermitInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  fearLevel: FearLevel;
}

export interface PermitBreakdown {
  monthlySurplus: number;
  emergencyFund: number;
  excessSavings: number;
  baseFunBudget: number;
  savingBonus: number;
  fearMultiplier: number;
  rawAmount: number;
  cap: number;
}

export interface PermitResult {
  /** 許可額（丸め済み・上限適用済み） */
  permitAmount: number;
  /** 0円以下 → 「おとなしくしてください」判定 */
  isGrounded: boolean;
  breakdown: PermitBreakdown;
}

export function roundToUnit(value: number, unit: number = PERMIT_RULES.ROUNDING_UNIT): number {
  return Math.floor(value / unit) * unit;
}

export function calculatePermit(input: PermitInput): PermitResult {
  const income = Math.max(0, input.monthlyIncome);
  const expenses = Math.max(0, input.monthlyExpenses);
  const savings = Math.max(0, input.savings);

  const monthlySurplus = Math.max(0, income - expenses);
  const emergencyFund = expenses * PERMIT_RULES.EMERGENCY_FUND_MONTHS;
  const excessSavings = Math.max(0, savings - emergencyFund);

  const baseFunBudget = monthlySurplus * PERMIT_RULES.SURPLUS_RATE;
  const savingBonus = excessSavings / PERMIT_RULES.SAVINGS_BONUS_MONTHS;
  const fearMultiplier = FEAR_MULTIPLIERS[input.fearLevel];

  const rawAmount = (baseFunBudget + savingBonus) * fearMultiplier;
  const cap = income * PERMIT_RULES.INCOME_CAP_RATE;

  const permitAmount = roundToUnit(Math.min(rawAmount, cap));

  return {
    permitAmount: Math.max(0, permitAmount),
    isGrounded: permitAmount <= 0,
    breakdown: {
      monthlySurplus,
      emergencyFund,
      excessSavings,
      baseFunBudget,
      savingBonus,
      fearMultiplier,
      rawAmount,
      cap,
    },
  };
}

/* ---------- おすすめ無駄遣い ---------- */

export function getRecommendationTier(amount: number): RecommendationTier {
  return (
    RECOMMENDATION_TIERS.find((tier) => amount <= tier.maxAmount) ??
    RECOMMENDATION_TIERS[RECOMMENDATION_TIERS.length - 1]
  );
}
