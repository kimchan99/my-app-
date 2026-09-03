"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "md" | "lg";
};

const base =
  "inline-flex w-full items-center justify-center gap-2 font-bold tracking-wide transition-transform duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-[2px]";

const variants = {
  primary: "bg-ink text-paper border-2 border-ink hover:bg-accent hover:border-accent",
  secondary: "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper",
  ghost: "bg-transparent text-ink-soft underline underline-offset-4 decoration-1 hover:text-ink",
  inverse: "bg-paper text-ink border-2 border-paper hover:bg-accent hover:border-accent hover:text-paper",
};

const sizes = {
  md: "px-5 py-3 text-base",
  lg: "px-6 py-5 text-lg",
};

export function Button({ variant = "primary", size = "md", className = "", ...rest }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
}
