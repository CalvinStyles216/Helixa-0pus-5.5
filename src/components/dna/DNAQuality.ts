export type QualityLevel = "high" | "medium" | "low";

export interface QualityProfile {
  level: QualityLevel;
  /** Maximum device pixel ratio used by the renderer. */
  dprCap: number;
  /** Multiplier applied to backbone segment counts. */
  segmentScale: number;
  /** Multiplier applied to particle counts. */
  particleScale: number;
  /** Sphere tessellation (width segments). */
  sphereSegments: number;
  /** Depth-of-field post pass enabled. */
  dof: boolean;
  /** Number of taps in the depth-of-field gather kernel. */
  dofSamples: number;
  /** MSAA samples for the offscreen target. */
  msaa: number;
  /** Use a prefiltered environment map for crystalline reflections. */
  envMap: boolean;
  /** Maximum surface cluster beads per backbone bead. */
  maxClusters: number;
}

const PROFILES: Record<QualityLevel, QualityProfile> = {
  high: {
    level: "high",
    dprCap: 1.6,
    segmentScale: 1,
    particleScale: 1,
    sphereSegments: 16,
    dof: true,
    dofSamples: 28,
    msaa: 4,
    envMap: true,
    maxClusters: 3,
  },
  medium: {
    level: "medium",
    dprCap: 1.35,
    segmentScale: 0.7,
    particleScale: 0.6,
    sphereSegments: 14,
    dof: true,
    dofSamples: 18,
    msaa: 2,
    envMap: true,
    maxClusters: 2,
  },
  low: {
    level: "low",
    dprCap: 1.25,
    segmentScale: 0.42,
    particleScale: 0.32,
    sphereSegments: 10,
    dof: false,
    dofSamples: 0,
    msaa: 0,
    envMap: false,
    maxClusters: 1,
  },
};

/** Heuristic device capability detection (runs client-side only). */
export function detectQualityLevel(): QualityLevel {
  if (typeof window === "undefined") return "medium";
  const w = window.innerWidth;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (w < 768 || (coarse && w < 1100) || memory <= 2) return "low";
  if (w < 1200 || cores <= 4 || memory <= 4 || coarse) return "medium";
  return "high";
}

export function getQualityProfile(level?: QualityLevel): QualityProfile {
  return PROFILES[level ?? detectQualityLevel()];
}
