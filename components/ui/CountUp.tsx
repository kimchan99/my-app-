"use client";

import { animate } from "framer-motion";
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

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
      onComplete,
    });
    return () => controls.stop();
  }, [value, duration, delay, onComplete]);

  return (
    <span className={className} aria-live="off">
      {format(display)}
    </span>
  );
}
