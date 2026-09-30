import type { Group, Object3D, PerspectiveCamera } from "three";

export type Vec3Tuple = [number, number, number];

export interface DNAColors {
  /** Primary backbone tone. */
  strand: string;
  /** Secondary backbone tone (mixed per-bead for crystalline variation). */
  strandAlt: string;
  /** Highlight droplets mixed into surface clusters. */
  highlight: string;
  /** Base-pair rung colours (each half of a pair gets one). */
  rung: string;
  rungAlt: string;
  /** Fresnel rim colour. */
  rim: string;
  emissive: string;
  /** Micro-particle surface grain. */
  grain: string;
}

export interface DNADepthOfField {
  enabled: boolean;
  /** Camera-space distance that is perfectly sharp. */
  focusDistance: number;
  /** Distance over which blur ramps from 0 to max. */
  focusRange: number;
  /** Maximum blur radius in CSS pixels. */
  maxBlur: number;
}

export interface DNAAmbientConfig {
  dust: number;
  bubbles: number;
  center: Vec3Tuple;
  spread: Vec3Tuple;
  color: string;
  bubbleColor: string;
  drift: number;
  size: number;
  bubbleSize: number;
  opacity: number;
}

export interface DNALights {
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  key: string;
  keyIntensity: number;
  keyPosition: Vec3Tuple;
  rim: string;
  rimIntensity: number;
  rimPosition: Vec3Tuple;
  envIntensity: number;
}

export interface DNAStageContext {
  group: Group;
  camera: PerspectiveCamera;
  ambient: Object3D | null;
  /** 0 when the stage enters from the bottom of the viewport, 1 when it leaves at the top. */
  progress: number;
  /** 0..1 as the top of the stage travels from viewport bottom to viewport top. */
  enter: number;
  /** 0..1 as the stage scrolls out past the top of the viewport. */
  exit: number;
  /** Smoothed pointer, -1..1. */
  pointer: { x: number; y: number };
  time: number;
  width: number;
  height: number;
  aspect: number;
}

export interface DNAStageResult {
  /** Slides the helix pattern along the spline (in spline-u units). */
  shift?: number;
}

export interface DNAConfig {
  /** Control points for the THREE.CatmullRomCurve3 axis. */
  path: Vec3Tuple[];
  /** 0 = straight line between endpoints, 1 = authored path, >1 exaggerates. */
  curvature: number;
  tension: number;
  radius: number;
  turns: number;
  /** Backbone beads per strand at high quality. */
  segments: number;
  rungsPerTurn: number;
  strandThickness: number;
  rungThickness: number;
  rungStyle: "beads" | "rod";
  rungBeads: number;
  /** Angular separation between the two backbones (radians). */
  strandOffset: number;
  /** Extra micro-beads clustered around each backbone bead (surface detail). */
  surfaceClusters: number;
  /** Axial angular velocity in radians / second. */
  rotationSpeed: number;
  phaseOffset: number;
  /** Amplitude of slow travelling twist. */
  twist: number;
  /** Amplitude of organic axis oscillation. */
  wobble: number;
  scale: number;
  colors: DNAColors;
  emissiveIntensity: number;
  roughness: number;
  clearcoat: number;
  rimStrength: number;
  rimPower: number;
  /** Fake transmission: mixes the backdrop tone into bead cores. */
  transmission: number;
  transmissionColor: string;
  /** 1 = opaque. */
  opacity: number;
  /** Surface grain particles per bead. */
  particleDensity: number;
  grainSize: number;
  fog: { color: string; near: number; far: number } | null;
  dof: DNADepthOfField;
  camera: { fov: number; position: Vec3Tuple; target: Vec3Tuple };
  ambient: DNAAmbientConfig | null;
  lights: DNALights;
  stage?: (ctx: DNAStageContext) => DNAStageResult | void;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

/* ------------------------------------------------------------------ */
/* HERO — luminous crystalline arch entering from the upper right       */
/* ------------------------------------------------------------------ */
export const HERO_DNA: DNAConfig = {
  path: [
    [16, 10.5, -11],
    [9.2, 5.6, -6],
    [4.6, 3.1, -2.6],
    [1.6, 0.4, 0],
    [-1.4, -2.0, 2.2],
    [-4.6, -3.0, 4.2],
    [-10, -4.6, 6.8],
  ],
  curvature: 1,
  tension: 0.5,
  radius: 1.95,
  turns: 3.1,
  segments: 520,
  rungsPerTurn: 5,
  strandThickness: 0.46,
  rungThickness: 0.2,
  rungStyle: "beads",
  rungBeads: 12,
  strandOffset: Math.PI * 0.92,
  surfaceClusters: 3,
  rotationSpeed: 0.16,
  phaseOffset: 0.4,
  twist: 0.22,
  wobble: 0.14,
  scale: 1,
  colors: {
    strand: "#6fd3f6",
    strandAlt: "#2b86d6",
    highlight: "#e6fbff",
    rung: "#8fe2fb",
    rungAlt: "#49b3ec",
    rim: "#c9f6ff",
    emissive: "#1c78c4",
    grain: "#f2fdff",
  },
  emissiveIntensity: 0.42,
  roughness: 0.28,
  clearcoat: 1,
  rimStrength: 0.9,
  rimPower: 2.2,
  transmission: 0.35,
  transmissionColor: "#4f97da",
  opacity: 1,
  particleDensity: 3.2,
  grainSize: 0.07,
  fog: { color: "#4a8dd3", near: 15, far: 36 },
  dof: { enabled: true, focusDistance: 17.5, focusRange: 7, maxBlur: 20 },
  camera: { fov: 35, position: [0, 0, 16], target: [0, 0, 0] },
  ambient: {
    dust: 900,
    bubbles: 70,
    center: [2.5, 0.5, 0],
    spread: [22, 13, 14],
    color: "#e8fbff",
    bubbleColor: "#dff7ff",
    drift: 0.35,
    size: 0.05,
    bubbleSize: 0.22,
    opacity: 0.75,
  },
  lights: {
    hemiSky: "#d9f6ff",
    hemiGround: "#123f86",
    hemiIntensity: 0.8,
    key: "#ffffff",
    keyIntensity: 1.9,
    keyPosition: [-4, 9, 8],
    rim: "#7fe3ff",
    rimIntensity: 2.0,
    rimPosition: [6, -2, -8],
    envIntensity: 0.5,
  },
  stage: ({ group, camera, exit, pointer, aspect, ambient }) => {
    const refAspect = 1.75;
    const narrow = aspect < refAspect ? Math.min(Math.pow(refAspect / aspect, 0.5), 2.2) : 1;
    const mobile = aspect < 0.9;
    camera.position.set(pointer.x * 0.35, pointer.y * 0.22, 16 * narrow);
    camera.lookAt(mobile ? 1.6 : 0, mobile ? -1.4 : 0, 0);
    group.position.set(exit * 1.6 + (mobile ? 1.2 : 0), -exit * 1.4 + (mobile ? -1.8 : 0), 0);
    group.rotation.set(pointer.y * 0.025, pointer.x * 0.045 + exit * 0.14, -exit * 0.07);
    if (ambient) {
      ambient.position.set(pointer.x * 0.55, pointer.y * 0.4, 0);
      ambient.rotation.y = pointer.x * 0.03;
    }
  },
};

/* ------------------------------------------------------------------ */
/* ABOUT — tilted vertical helix, blurred top, sharp lower crossings    */
/* ------------------------------------------------------------------ */
export const ABOUT_DNA: DNAConfig = {
  path: [
    [5.2, 10.5, -9],
    [2.8, 5.2, -5.4],
    [0.9, 1.6, -2.6],
    [-1.2, -1.8, 0],
    [-3.2, -4.6, 1.6],
    [-6.4, -8.6, 3.4],
  ],
  curvature: 1,
  tension: 0.5,
  radius: 1.3,
  turns: 3.6,
  segments: 420,
  rungsPerTurn: 5,
  strandThickness: 0.33,
  rungThickness: 0.11,
  rungStyle: "beads",
  rungBeads: 10,
  strandOffset: Math.PI * 0.9,
  surfaceClusters: 3,
  rotationSpeed: 0.12,
  phaseOffset: 1.3,
  twist: 0.16,
  wobble: 0.08,
  scale: 1,
  colors: {
    strand: "#4b8fe0",
    strandAlt: "#1f5cc2",
    highlight: "#cfe8ff",
    rung: "#6aa9ec",
    rungAlt: "#2e6fd0",
    rim: "#d8ecff",
    emissive: "#0f3f9a",
    grain: "#e9f5ff",
  },
  emissiveIntensity: 0.35,
  roughness: 0.32,
  clearcoat: 0.9,
  rimStrength: 0.75,
  rimPower: 2.1,
  transmission: 0.22,
  transmissionColor: "#9cc6f3",
  opacity: 1,
  particleDensity: 2.6,
  grainSize: 0.05,
  fog: { color: "#eaf3ff", near: 17, far: 30 },
  dof: { enabled: true, focusDistance: 13.6, focusRange: 3.6, maxBlur: 26 },
  camera: { fov: 35, position: [0, 0, 14], target: [0, 0, 0] },
  ambient: null,
  lights: {
    hemiSky: "#ffffff",
    hemiGround: "#1d4fae",
    hemiIntensity: 0.85,
    key: "#ffffff",
    keyIntensity: 2.0,
    keyPosition: [4, 8, 9],
    rim: "#a8d7ff",
    rimIntensity: 1.5,
    rimPosition: [-6, 2, -6],
    envIntensity: 0.45,
  },
  stage: ({ group, camera, progress, enter, pointer, aspect }) => {
    const refAspect = 0.95;
    const narrow = aspect < refAspect ? Math.min(Math.pow(refAspect / aspect, 0.6), 1.9) : 1;
    const wide = aspect > 1.3;
    const settle = easeOutCubic(enter * 1.15);
    camera.position.set(pointer.x * 0.2, pointer.y * 0.15, 14 * narrow);
    camera.lookAt(wide ? -0.6 : 0, 0, 0);
    group.position.set(
      -(1 - settle) * 1.4 + (wide ? 0.8 : 0),
      (0.5 - progress) * 1.8 - (1 - settle) * 1.6,
      0,
    );
    group.rotation.set(0, pointer.x * 0.05, (progress - 0.5) * 0.16);
  },
};

/* ------------------------------------------------------------------ */
/* PROCESS — enormous horizontal arch with dynamic callout anchors      */
/* ------------------------------------------------------------------ */
export const PROCESS_DNA: DNAConfig = {
  path: [
    [-17, -6.2, 4],
    [-10, -2.4, 2.2],
    [-4.2, -1.0, 0.8],
    [1, -1.7, 0],
    [5.6, -3.0, -0.6],
    [10, -1.9, -1.4],
    [17, 0.4, -3],
  ],
  curvature: 1,
  tension: 0.5,
  radius: 1.95,
  turns: 5.2,
  segments: 230,
  rungsPerTurn: 10,
  strandThickness: 0.4,
  rungThickness: 0.1,
  rungStyle: "rod",
  rungBeads: 0,
  strandOffset: Math.PI,
  surfaceClusters: 1,
  rotationSpeed: 0.1,
  phaseOffset: 0.2,
  twist: 0.12,
  wobble: 0.06,
  scale: 1,
  colors: {
    strand: "#2f63d8",
    strandAlt: "#1b3fb2",
    highlight: "#dbeaff",
    rung: "#0d2f9f",
    rungAlt: "#0a1f7c",
    rim: "#eef6ff",
    emissive: "#0a2a8c",
    grain: "#e8f3ff",
  },
  emissiveIntensity: 0.3,
  roughness: 0.42,
  clearcoat: 0.7,
  rimStrength: 1.35,
  rimPower: 1.7,
  transmission: 0.12,
  transmissionColor: "#8cc4e6",
  opacity: 1,
  particleDensity: 5,
  grainSize: 0.045,
  fog: { color: "#9fcfe8", near: 22, far: 40 },
  dof: { enabled: true, focusDistance: 20, focusRange: 10, maxBlur: 8 },
  camera: { fov: 32, position: [0, 0, 20], target: [0, 0, 0] },
  ambient: null,
  lights: {
    hemiSky: "#ffffff",
    hemiGround: "#0b2a86",
    hemiIntensity: 0.75,
    key: "#ffffff",
    keyIntensity: 1.8,
    keyPosition: [2, 10, 10],
    rim: "#c9e6ff",
    rimIntensity: 1.3,
    rimPosition: [0, -6, -8],
    envIntensity: 0.4,
  },
  stage: ({ group, camera, progress, pointer, aspect }) => {
    const refAspect = 1.6;
    const narrow = aspect < refAspect ? Math.min(Math.pow(refAspect / aspect, 0.75), 2.4) : 1;
    const mobile = aspect < 1.2;
    camera.position.set(pointer.x * 0.25, pointer.y * 0.18, (20 - progress * 1.1) * narrow);
    camera.lookAt(0, mobile ? -2.1 : 0, 0);
    group.position.set((0.5 - progress) * 1.1, 0, 0);
    group.rotation.set(pointer.y * 0.015, pointer.x * 0.02, 0);
    return { shift: progress * 0.3 };
  },
};
