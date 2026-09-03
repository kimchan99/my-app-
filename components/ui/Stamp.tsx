"use client";

import { motion } from "framer-motion";

interface StampProps {
  text: string;
  subText?: string;
  variant?: "circle" | "box";
  size?: number;
  rotate?: number;
  delay?: number;
  animate?: boolean;
  className?: string;
}

/**
 * 朱肉っぽい赤のスタンプ。animate=true のとき「押される」動きをする。
 */
export function Stamp({
  text,
  subText,
  variant = "circle",
  size = 112,
  rotate = -12,
  delay = 0,
  animate = true,
  className = "",
}: StampProps) {
  const shape =
    variant === "circle"
      ? "rounded-full"
      : "rounded-[2px] px-3";

  return (
    <motion.div
      aria-hidden="true"
      initial={animate ? { opacity: 0, scale: 2.2, rotate: rotate - 8 } : false}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: "spring", stiffness: 520, damping: 24, mass: 0.9, delay }}
      className={`stamp pointer-events-none flex flex-col items-center justify-center text-center font-mincho font-extrabold ${shape} ${className}`}
      style={{
        width: variant === "circle" ? size : undefined,
        height: variant === "circle" ? size : undefined,
        minHeight: variant === "box" ? size * 0.5 : undefined,
      }}
    >
      {variant === "circle" ? (
        <div className="flex h-[86%] w-[86%] flex-col items-center justify-center rounded-full border-[2px] border-accent">
          {subText && (
            <span className="text-[9px] leading-none tracking-[0.15em]">{subText}</span>
          )}
          <span
            className="leading-none tracking-[0.05em]"
            style={{ fontSize: size * (text.length > 2 ? 0.22 : 0.32) }}
          >
            {text}
          </span>
        </div>
      ) : (
        <span className="text-xl leading-none tracking-[0.3em]">{text}</span>
      )}
    </motion.div>
  );
}
