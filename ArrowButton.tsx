import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowRight } from "./Icons";
import { MICRO_SPRING } from "@/motion/transitions";
import { cn } from "@/utils/cn";

/**
 * Blue circular arrow — the shared micro-interaction primitive. It reacts to
 * the parent's "hover"/"tap" variants so every arrow control on the page
 * moves with the same physics.
 */
export function ArrowCircle({ className, size = 42 }: { className?: string; size?: number }) {
  return (
    <motion.span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full text-white",
        "bg-[radial-gradient(circle_at_35%_30%,#6aa6ff_0%,#3f80f2_55%,#2f6fe4_100%)] shadow-[0_2px_10px_-2px_rgba(47,111,228,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]",
        className,
      )}
      style={{ width: size, height: size }}
      variants={{ rest: { scale: 1 }, hover: { scale: 1.07 }, tap: { scale: 0.94 } }}
      transition={MICRO_SPRING}
    >
      <motion.span
        className="inline-flex"
        variants={{ rest: { x: 0 }, hover: { x: 3 }, tap: { x: 1 } }}
        transition={MICRO_SPRING}
      >
        <ArrowRight className="h-[38%] min-h-3.5 w-auto" style={{ height: size * 0.38 }} />
      </motion.span>
    </motion.span>
  );
}

interface PillButtonProps {
  children: ReactNode;
  href?: string;
  className?: string;
  size?: "md" | "lg";
  ariaLabel?: string;
}

/** White capsule with label + arrow circle (Contact Us / Get Started). */
export function PillButton({ children, href = "#", className, size = "md", ariaLabel }: PillButtonProps) {
  const reduce = useReducedMotion();
  const circle = size === "lg" ? 46 : 38;
  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : "hover"}
      whileTap="tap"
      whileFocus={reduce ? undefined : "hover"}
      variants={{ rest: { x: 0 }, hover: { x: 1 }, tap: { scale: 0.98 } }}
      transition={MICRO_SPRING}
      className={cn(
        "focus-ring group inline-flex items-center justify-between rounded-full bg-white text-helixa-ink",
        "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_24px_-12px_rgba(10,40,90,0.45)] ring-1 ring-white/70",
        size === "lg" ? "gap-8 py-[3px] pl-[22px] pr-[3px] text-[clamp(16px,1.35vw,21px)]" : "gap-6 py-[3px] pl-[18px] pr-[3px] text-[clamp(14px,1.1vw,17px)]",
        className,
      )}
    >
      <span className="font-display tracking-[-0.01em]">{children}</span>
      <ArrowCircle size={circle} />
    </motion.a>
  );
}
