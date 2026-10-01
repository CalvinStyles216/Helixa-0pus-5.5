import { BufferAttribute, BufferGeometry, Group, Points, type ShaderMaterial } from "three";
import type { DNAAmbientConfig } from "./DNAConfig";
import { createPointMaterial } from "./DNAMaterial";

export type Random = () => number;

/** Deterministic PRNG so every instance renders identically between reloads. */
export function mulberry32(seed: number): Random {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomUnit(rand: Random, out: Float32Array, offset: number): void {
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  out[offset] = Math.cos(a) * r;
  out[offset + 1] = Math.sin(a) * r;
  out[offset + 2] = z;
}

/* ------------------------------------------------------------------ */
/* Surface grain: tiny glowing microspheres riding on the backbone beads */
/* ------------------------------------------------------------------ */
export interface SurfaceGrain {
  points: Points;
  material: ShaderMaterial;
  /** Recompute positions from current bead centres / radii. */
  update(centers: Float32Array, radii: Float32Array): void;
  dispose(): void;
}

export function createSurfaceGrain(
  count: number,
  beadCount: number,
  color: string,
  size: number,
  rand: Random,
): SurfaceGrain {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const anchors = new Uint32Array(count);
  const dirs = new Float32Array(count * 3);
  const mags = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    anchors[i] = Math.floor(rand() * beadCount);
    randomUnit(rand, dirs, i * 3);
    mags[i] = 0.92 + rand() * 0.22;
    const big = rand() < 0.06;
    sizes[i] = size * (big ? 1.8 + rand() * 1.4 : 0.45 + rand() * 0.9);
    seeds[i] = rand();
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  const material = createPointMaterial({ color, opacity: 0.9, kind: "grain", drift: 0 });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  const posAttr = geometry.getAttribute("position") as BufferAttribute;

  return {
    points,
    material,
    update(centers, radii) {
      for (let i = 0; i < count; i++) {
        const a = anchors[i];
        const r = radii[a] * mags[i];
        const o = i * 3;
        const c = a * 3;
        positions[o] = centers[c] + dirs[o] * r;
        positions[o + 1] = centers[c + 1] + dirs[o + 1] * r;
        positions[o + 2] = centers[c + 2] + dirs[o + 2] * r;
      }
      posAttr.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Ambient molecular field: dust, glowing spheres and larger bubbles     */
/* ------------------------------------------------------------------ */
export interface AmbientField {
  group: Group;
  materials: ShaderMaterial[];
  dispose(): void;
}

function buildCloud(
  count: number,
  cfg: DNAAmbientConfig,
  baseSize: number,
  sizeJitter: number,
  rand: Random,
): BufferGeometry {
  const g = new BufferGeometry();
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = cfg.center[0] + (rand() - 0.5) * cfg.spread[0];
    pos[i * 3 + 1] = cfg.center[1] + (rand() - 0.5) * cfg.spread[1];
    pos[i * 3 + 2] = cfg.center[2] + (rand() - 0.5) * cfg.spread[2];
    const r = rand();
    sizes[i] = baseSize * (0.35 + Math.pow(r, 3) * sizeJitter);
    seeds[i] = rand();
  }
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("aSize", new BufferAttribute(sizes, 1));
  g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return g;
}

export function createAmbientField(cfg: DNAAmbientConfig, particleScale: number, rand: Random): AmbientField {
  const group = new Group();
  const dustCount = Math.max(60, Math.round(cfg.dust * particleScale));
  const bubbleCount = Math.max(10, Math.round(cfg.bubbles * particleScale));

  const dustGeo = buildCloud(dustCount, cfg, cfg.size, 3.2, rand);
  const dustMat = createPointMaterial({ color: cfg.color, opacity: cfg.opacity, kind: "grain", drift: cfg.drift });
  const dust = new Points(dustGeo, dustMat);
  dust.frustumCulled = false;

  const bubbleGeo = buildCloud(bubbleCount, cfg, cfg.bubbleSize, 2.4, rand);
  const bubbleMat = createPointMaterial({
    color: cfg.bubbleColor,
    opacity: cfg.opacity * 0.85,
    kind: "bubble",
    drift: cfg.drift * 0.7,
  });
  const bubbles = new Points(bubbleGeo, bubbleMat);
  bubbles.frustumCulled = false;

  group.add(dust, bubbles);
  return {
    group,
    materials: [dustMat, bubbleMat],
    dispose() {
      dustGeo.dispose();
      bubbleGeo.dispose();
      dustMat.dispose();
      bubbleMat.dispose();
    },
  };
}
