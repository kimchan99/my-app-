import { STORAGE_KEY, type FearLevel } from "./constants";

export interface StoredInputs {
  age: number;
  name: string;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  savings: number | null;
  fearLevel: FearLevel;
}

export function loadStoredInputs(): Partial<StoredInputs> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<StoredInputs>;
  } catch {
    return null;
  }
}

export function saveStoredInputs(inputs: StoredInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* プライベートモードなどで失敗しても何もしない */
  }
}
