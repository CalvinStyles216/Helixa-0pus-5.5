import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/motion/transitions";
import { cn } from "@/utils/cn";

export function SectionLabel({ children, tone = "light", className }: { children: string; tone?: "light" | "onBlue"; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO }}
      className={cn(
        "inline-flex items-center rounded-[5px] px-[10px] py-[5px] text-[clamp(12.5px,0.95vw,14.5px)] leading-none tracking-[-0.005em]",
        tone === "light" ? "bg-[#f1f1f1] text-helixa-ink" : "bg-white text-helixa-ink shadow-[0_2px_10px_-4px_rgba(0,30,80,0.3)]",
        className,
      )}
    >
      {children}
    </motion.p>
  );
}
