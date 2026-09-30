import { useEffect, useRef } from "react";
import { mulberry32 } from "@/components/dna/DNAParticles";
import { cn } from "@/utils/cn";

/**
 * Procedural microscopic cell texture: jittered-grid Voronoi membranes
 * (F2 − F1 edge distance) modulated by low-frequency density, plus clusters
 * of vesicle bubbles. Generated once per size on a 2D canvas — no image asset.
 */
export function CellularField({ className, seed = 3 }: { className?: string; seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let timer = 0;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const scale = 0.6;
      const W = Math.max(64, Math.round(parent.clientWidth * scale));
      const H = Math.max(64, Math.round(parent.clientHeight * scale));
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rand = mulberry32(seed);

      const cell = Math.max(26, Math.round(W / 26));
      const gx = Math.ceil(W / cell) + 3;
      const gy = Math.ceil(H / cell) + 3;
      const sx = new Float32Array(gx * gy);
      const sy = new Float32Array(gx * gy);
      for (let j = 0; j < gy; j++) {
        for (let i = 0; i < gx; i++) {
          sx[j * gx + i] = (i - 1 + 0.15 + rand() * 0.7) * cell;
          sy[j * gx + i] = (j - 1 + 0.15 + rand() * 0.7) * cell;
        }
      }
      // Low-frequency density field from a few random blobs.
      const blobs = Array.from({ length: 9 }, () => ({ x: rand() * W, y: rand() * H, r: (0.12 + rand() * 0.25) * W }));

      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let y = 0; y < H; y++) {
        const cy = Math.floor(y / cell) + 1;
        for (let x = 0; x < W; x++) {
          const cx = Math.floor(x / cell) + 1;
          let f1 = 1e9;
          let f2 = 1e9;
          for (let oy = -1; oy <= 1; oy++) {
            const row = (cy + oy) * gx;
            for (let ox = -1; ox <= 1; ox++) {
              const k = row + cx + ox;
              const dx = sx[k] - x;
              const dy = sy[k] - y;
              const dd = dx * dx + dy * dy;
              if (dd < f1) {
                f2 = f1;
                f1 = dd;
              } else if (dd < f2) f2 = dd;
            }
          }
          const edge = Math.sqrt(f2) - Math.sqrt(f1);
          let a = edge < 1.8 ? 1 - edge / 1.8 : 0;
          if (a > 0) {
            let dens = 0.25;
            for (const b of blobs) {
              const q = ((x - b.x) ** 2 + (y - b.y) ** 2) / (b.r * b.r);
              if (q < 1) dens += (1 - q) * 0.6;
            }
            a *= Math.min(dens, 1);
          }
          const o = (y * W + x) * 4;
          d[o] = 235;
          d[o + 1] = 247;
          d[o + 2] = 255;
          d[o + 3] = a * 150;
        }
      }
      ctx.putImageData(img, 0, 0);

      // Vesicle clusters
      ctx.lineWidth = 0.8;
      for (let c = 0; c < 26; c++) {
        const bx = rand() * W;
        const by = rand() * H;
        const n = 4 + Math.floor(rand() * 12);
        for (let k = 0; k < n; k++) {
          const r = 1.2 + Math.pow(rand(), 2) * cell * 0.28;
          const px = bx + (rand() - 0.5) * cell * 1.1;
          const py = by + (rand() - 0.5) * cell * 1.1;
          ctx.strokeStyle = `rgba(235,247,255,${0.18 + rand() * 0.3})`;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    draw();
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 180);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [seed]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
