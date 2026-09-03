"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface CountUpProps {
  value: number;
  /** 秒 */
  duration?: number;
  delay?: number;
  format: (value: number) => string;
  onComplete?: () => void;
  className?: string;
}

export function CountUp({
  value,
  duration = 1.4,
  delay = 0,
  format,
  onComplete,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const controls = animate(0, value, {
      duration: reduced ? 0 : duration,
      delay: reduced ? 0 : delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
      onComplete,
    });
    return () => controls.stop();
  }, [value, duration, delay, onComplete, reduced]);

  return (
    <span className={className} aria-hidden="true">
      {format(display)}
    </span>
  );
}
