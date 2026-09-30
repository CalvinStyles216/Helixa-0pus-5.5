import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export type NotchSize = "lg" | "sm";

/** Mirrors the CSS clamp() used by `.notch` / `.notch-sm` so the hairline follows the clip exactly. */
export function notchDims(size: NotchSize, vw: number) {
  const c = (min: number, pref: number, max: number) => Math.min(max, Math.max(min, pref));
  return size === "lg"
    ? { nx: c(56, vw * 0.064, 96), ny: c(42, vw * 0.049, 72) }
    : { nx: c(34, vw * 0.034, 50), ny: c(30, vw * 0.029, 42) };
}

interface NotchCardProps {
  children?: ReactNode;
  size?: NotchSize;
  className?: string;
  /** Tailwind classes applied to the hairline stroke (e.g. stroke colour + hover state). */
  strokeClassName?: string;
  style?: CSSProperties;
}

/**
 * Architectural card with the signature clipped top-right corner and a 1px
 * hairline border that follows the notch diagonal.
 */
export function NotchCard({ children, size = "lg", className, strokeClassName, style }: NotchCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, nx: 0, ny: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const d = notchDims(size, window.innerWidth);
      setBox({ w: el.offsetWidth, h: el.offsetHeight, ...d });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const { w, h, nx, ny } = box;
  return (
    <div ref={ref} className={cn("relative", size === "lg" ? "notch" : "notch-sm", className)} style={style}>
      {children}
      {w > 0 && (
        <svg
          className="notch-border"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={`M0.5 0.5 H${w - nx} L${w - 0.5} ${ny} V${h - 0.5} H0.5 Z`}
            fill="none"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className={cn("transition-[stroke] duration-700", strokeClassName ?? "stroke-black/10")}
          />
        </svg>
      )}
    </div>
  );
}
