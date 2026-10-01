import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE_OUT_QUART } from "@/motion/transitions";

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
  className?: string;
}

/** Restrained, one-shot count-up written straight to the DOM (no re-renders). */
export function CountUp({ to, decimals = 0, suffix = "", delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const format = (v: number) => `${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = format(to);
      return;
    }
    const controls = animate(to * 0.82, to, {
      duration: 2.2,
      delay,
      ease: EASE_OUT_QUART,
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to, delay]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
