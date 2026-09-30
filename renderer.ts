import { ColorManagement, LinearSRGBColorSpace, NoToneMapping, WebGLRenderer } from "three";

// Colours are authored directly in display space; disabling colour management
// keeps them 1:1 with the CSS design tokens used by the DOM layer.
ColorManagement.enabled = false;

export function createRenderer(canvas: HTMLCanvasElement, dpr: number, antialias: boolean): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    return renderer;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* One shared requestAnimationFrame loop for every WebGL stage.         */
/* ------------------------------------------------------------------ */
export type TickFn = (dt: number, now: number) => void;

const subscribers = new Set<TickFn>();
let rafId = 0;
let last = 0;

function loop(now: number) {
  const dt = Math.min((now - last) / 1000, 1 / 20);
  last = now;
  subscribers.forEach((fn) => fn(dt, now / 1000));
  rafId = subscribers.size > 0 ? requestAnimationFrame(loop) : 0;
}

export function subscribeTick(fn: TickFn): () => void {
  subscribers.add(fn);
  if (!rafId) {
    last = performance.now();
    rafId = requestAnimationFrame(loop);
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}
