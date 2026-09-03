"use client";

import { useReducedMotion } from "framer-motion";

/**
 * prefers-reduced-motion のとき演出の遅延を大幅に縮める係数。
 * 内容を隠す「間」を作らないためのもの（0 にはせず、順序だけ残す）。
 */
export function useDelayScale(): number {
  const reduced = useReducedMotion();
  return reduced ? 0.15 : 1;
}
