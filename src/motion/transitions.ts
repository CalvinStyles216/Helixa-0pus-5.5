import type { Transition } from "framer-motion";

export type Bezier = [number, number, number, number];

export const EASE_OUT_EXPO: Bezier = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: Bezier = [0.25, 1, 0.5, 1];
export const EASE_CINEMATIC: Bezier = [0.22, 0.61, 0.36, 1];

export const slow = (delay = 0, duration = 1.2): Transition => ({
  duration,
  delay,
  ease: EASE_OUT_EXPO,
});

/** Shared micro-interaction spring for arrow buttons (critically damped — no bounce). */
export const MICRO_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.6 };
