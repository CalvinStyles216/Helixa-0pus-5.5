import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { EASE_OUT_EXPO } from "./transitions";

const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

interface FadeUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  blur?: boolean;
  duration?: number;
}

/** Soft upward fade used for paragraphs, cards and supporting UI. */
export function FadeUp({ delay = 0, y = 24, blur = false, duration = 1.2, children, ...rest }: FadeUpProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: blur ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT}
      transition={{ duration: reduce ? 0.4 : duration, delay: reduce ? 0 : delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface RevealLine {
  key: string;
  content: ReactNode;
}

interface RevealLinesProps {
  lines: RevealLine[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Animate immediately on mount instead of on viewport entry. */
  immediate?: boolean;
}

/**
 * Line-by-line headline reveal: each line rises out of a clipping mask with a
 * very small blur-to-sharp transition.
 */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  immediate = false,
}: RevealLinesProps) {
  const reduce = useReducedMotion();
  const trigger = immediate ? { animate: "shown" } : { whileInView: "shown", viewport: VIEWPORT };
  return (
    <Tag className={className}>
      <motion.span className="block" initial="hidden" {...trigger}>
        {lines.map((line, i) => (
          <span key={line.key} className={`block overflow-hidden pb-[0.08em] -mb-[0.08em] ${lineClassName ?? ""}`}>
            <motion.span
              className="block"
              variants={{
                hidden: reduce ? { opacity: 0 } : { y: "105%", opacity: 0, filter: "blur(8px)" },
                shown: {
                  y: "0%",
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: reduce ? 0.4 : 1.35,
                    delay: reduce ? 0 : delay + i * stagger,
                    ease: EASE_OUT_EXPO,
                  },
                },
              }}
            >
              {line.content}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
