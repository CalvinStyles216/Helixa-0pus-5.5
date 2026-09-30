/* Global, allocation-free pointer + motion-preference stores shared by all stages. */

export interface PointerState {
  /** Normalised -1..1, +y up. */
  x: number;
  y: number;
}

export const pointer: PointerState = { x: 0, y: 0 };

let pointerBound = false;
export function bindPointer(): void {
  if (pointerBound || typeof window === "undefined") return;
  pointerBound = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!mq) return () => {};
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

export interface ScrollMetrics {
  progress: number;
  enter: number;
  exit: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Scroll metrics of an element relative to the viewport. */
export function measureScroll(rect: DOMRect, vh: number, out: ScrollMetrics): ScrollMetrics {
  out.progress = clamp01((vh - rect.top) / (vh + rect.height));
  out.enter = clamp01((vh - rect.top) / vh);
  out.exit = clamp01(-rect.top / Math.max(rect.height, 1));
  return out;
}
