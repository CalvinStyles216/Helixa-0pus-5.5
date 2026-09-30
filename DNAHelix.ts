import {
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
  type MeshPhysicalMaterial,
  type Texture,
} from "three";
import type { DNAConfig } from "./DNAConfig";
import type { QualityProfile } from "./DNAQuality";
import { buildCurve, frameAt, samplePath, type SampledPath } from "./DNAPath";
import { createCrystalMaterial } from "./DNAMaterial";
import { createSurfaceGrain, mulberry32, randomUnit, type SurfaceGrain } from "./DNAParticles";

const TAU = Math.PI * 2;
const BEAD_STRIDE = 6; // strand, u, radialJitter, angleJitter, scale, offsetMag
const RUNG_BEAD_STRIDE = 4; // rungIndex, t, scale, jitter

/**
 * Procedural double helix wrapped around a CatmullRom spline.
 *
 * Every frame the axial phase advances with elapsed time, and each bead is
 * re-positioned in the local (tangent, normal, binormal) frame of its spline
 * sample. The geometry itself revolves around its own curved axis — the
 * object is never simply spun as a rigid body.
 */
export class DNAHelix {
  readonly group = new Group();
  readonly path: SampledPath;
  readonly grain: SurfaceGrain | null;
  readonly pinSamples = 220;

  private readonly cfg: DNAConfig;
  private readonly sphere: SphereGeometry;
  private readonly cylinder: CylinderGeometry | null;
  private readonly material: MeshPhysicalMaterial;
  private readonly rungMaterial: MeshPhysicalMaterial;

  private readonly beadMesh: InstancedMesh;
  private readonly beadCount: number;
  private readonly beadFrames: Float32Array;
  private readonly beadParams: Float32Array;
  private readonly beadDirs: Float32Array;
  private readonly beadSeeds: Float32Array;
  private readonly centers: Float32Array;
  private readonly radii: Float32Array;

  private readonly rungMesh: InstancedMesh;
  private readonly rungCount: number;
  private readonly rungFrames: Float32Array;
  private readonly rungU: Float32Array;
  private readonly rungBeadCount: number;
  private readonly rungBeadParams: Float32Array;
  private readonly rungBeadDirs: Float32Array;

  private readonly pinFrames: Float32Array;
  private readonly pinU: Float32Array;

  private readonly tmpA = new Float32Array(3);
  private readonly tmpB = new Float32Array(3);
  private readonly m4 = new Matrix4();
  private readonly q = new Quaternion();
  private readonly v0 = new Vector3();
  private readonly v1 = new Vector3();
  private readonly vs = new Vector3();
  private readonly up = new Vector3(0, 1, 0);

  private phase = 0;
  private time = 0;
  private shift = 0;

  constructor(cfg: DNAConfig, quality: QualityProfile, seed = 7) {
    this.cfg = cfg;
    const rand = mulberry32(seed);
    const curve = buildCurve(cfg.path, cfg.curvature, cfg.tension);
    this.path = samplePath(curve, 640);

    this.sphere = new SphereGeometry(1, quality.sphereSegments, Math.max(6, Math.round(quality.sphereSegments * 0.7)));
    this.material = createCrystalMaterial({
      roughness: cfg.roughness,
      clearcoat: cfg.clearcoat,
      emissive: cfg.colors.emissive,
      emissiveIntensity: cfg.emissiveIntensity,
      rim: cfg.colors.rim,
      rimStrength: cfg.rimStrength,
      rimPower: cfg.rimPower,
      transmission: cfg.transmission,
      transmissionColor: cfg.transmissionColor,
      opacity: cfg.opacity,
      envIntensity: cfg.lights.envIntensity,
    });
    this.rungMaterial =
      cfg.rungStyle === "rod"
        ? createCrystalMaterial({
            roughness: cfg.roughness + 0.1,
            clearcoat: cfg.clearcoat * 0.6,
            emissive: cfg.colors.rungAlt,
            emissiveIntensity: cfg.emissiveIntensity * 0.6,
            rim: cfg.colors.rim,
            rimStrength: cfg.rimStrength * 0.3,
            rimPower: cfg.rimPower + 1,
            transmission: 0,
            transmissionColor: cfg.transmissionColor,
            opacity: cfg.opacity,
            envIntensity: cfg.lights.envIntensity * 0.5,
          })
        : this.material;

    /* ---------------- Backbone beads ---------------- */
    const S = Math.max(40, Math.round(cfg.segments * quality.segmentScale));
    const clusters = Math.min(cfg.surfaceClusters, quality.maxClusters);
    const perStrand = S * (1 + clusters);
    this.beadCount = perStrand * 2;
    this.beadFrames = new Float32Array(this.beadCount * 9);
    this.beadParams = new Float32Array(this.beadCount * BEAD_STRIDE);
    this.beadDirs = new Float32Array(this.beadCount * 3);
    this.beadSeeds = new Float32Array(this.beadCount);
    this.centers = new Float32Array(this.beadCount * 3);
    this.radii = new Float32Array(this.beadCount);

    this.beadMesh = new InstancedMesh(this.sphere, this.material, this.beadCount);
    this.beadMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.beadMesh.frustumCulled = false;

    const cStrand = new Color(cfg.colors.strand);
    const cAlt = new Color(cfg.colors.strandAlt);
    const cHi = new Color(cfg.colors.highlight);
    const col = new Color();

    let b = 0;
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < S; i++) {
        const u = i / (S - 1);
        for (let c = 0; c <= clusters; c++, b++) {
          const isCluster = c > 0;
          const uu = isCluster ? Math.min(Math.max(u + (rand() - 0.5) * (2.2 / S), 0), 1) : u;
          frameAt(this.path, uu, this.beadFrames, b * 9);
          const p = b * BEAD_STRIDE;
          this.beadParams[p] = s;
          this.beadParams[p + 1] = uu;
          this.beadParams[p + 2] = (rand() - 0.5) * 0.06;
          this.beadParams[p + 3] = (rand() - 0.5) * 0.05;
          this.beadParams[p + 4] = isCluster ? 0.32 + rand() * 0.42 : 0.86 + rand() * 0.28;
          this.beadParams[p + 5] = isCluster ? 0.55 + rand() * 0.5 : rand() * 0.12;
          randomUnit(rand, this.beadDirs, b * 3);
          this.beadSeeds[b] = rand();

          col.lerpColors(cStrand, cAlt, Math.pow(rand(), 1.4));
          if (isCluster && rand() < 0.4) col.lerp(cHi, 0.35 + rand() * 0.45);
          const l = 0.9 + rand() * 0.2;
          col.multiplyScalar(l);
          this.beadMesh.setColorAt(b, col);
        }
      }
    }
    if (this.beadMesh.instanceColor) this.beadMesh.instanceColor.needsUpdate = true;

    /* ---------------- Base-pair rungs ---------------- */
    this.rungCount = Math.max(4, Math.round(cfg.turns * cfg.rungsPerTurn));
    this.rungFrames = new Float32Array(this.rungCount * 9);
    this.rungU = new Float32Array(this.rungCount);
    for (let r = 0; r < this.rungCount; r++) {
      const u = (r + 0.5) / this.rungCount;
      this.rungU[r] = u;
      frameAt(this.path, u, this.rungFrames, r * 9);
    }

    const cRung = new Color(cfg.colors.rung);
    const cRungAlt = new Color(cfg.colors.rungAlt);
    if (cfg.rungStyle === "rod") {
      this.cylinder = new CylinderGeometry(1, 1, 1, quality.level === "low" ? 8 : 14, 1, false);
      this.rungBeadCount = 0;
      this.rungBeadParams = new Float32Array(0);
      this.rungBeadDirs = new Float32Array(0);
      this.rungMesh = new InstancedMesh(this.cylinder, this.rungMaterial, this.rungCount * 2);
      for (let r = 0; r < this.rungCount; r++) {
        this.rungMesh.setColorAt(r * 2, col.copy(cRung).multiplyScalar(0.92 + rand() * 0.16));
        this.rungMesh.setColorAt(r * 2 + 1, col.copy(cRungAlt).multiplyScalar(0.92 + rand() * 0.16));
      }
    } else {
      this.cylinder = null;
      const K = Math.max(4, Math.round(cfg.rungBeads * (quality.level === "low" ? 0.6 : 1)));
      this.rungBeadCount = this.rungCount * K;
      this.rungBeadParams = new Float32Array(this.rungBeadCount * RUNG_BEAD_STRIDE);
      this.rungBeadDirs = new Float32Array(this.rungBeadCount * 3);
      this.rungMesh = new InstancedMesh(this.sphere, this.rungMaterial, this.rungBeadCount);
      let k = 0;
      for (let r = 0; r < this.rungCount; r++) {
        for (let j = 0; j < K; j++, k++) {
          const p = k * RUNG_BEAD_STRIDE;
          this.rungBeadParams[p] = r;
          this.rungBeadParams[p + 1] = (j + 0.5) / K + (rand() - 0.5) * (0.5 / K);
          this.rungBeadParams[p + 2] = 0.7 + rand() * 0.6;
          this.rungBeadParams[p + 3] = rand() * 0.6;
          randomUnit(rand, this.rungBeadDirs, k * 3);
          col.lerpColors(cRung, cRungAlt, j < K / 2 ? rand() * 0.4 : 0.6 + rand() * 0.4);
          if (rand() < 0.25) col.lerp(cHi, 0.4);
          this.rungMesh.setColorAt(k, col);
        }
      }
    }
    this.rungMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.rungMesh.frustumCulled = false;
    if (this.rungMesh.instanceColor) this.rungMesh.instanceColor.needsUpdate = true;

    /* ---------------- Anchor samples (for DOM callouts) ---------------- */
    this.pinFrames = new Float32Array(this.pinSamples * 9);
    this.pinU = new Float32Array(this.pinSamples);
    for (let i = 0; i < this.pinSamples; i++) {
      const u = i / (this.pinSamples - 1);
      this.pinU[i] = u;
      frameAt(this.path, u, this.pinFrames, i * 9);
    }

    /* ---------------- Surface grain ---------------- */
    const grainCount = Math.round(S * 2 * cfg.particleDensity * quality.particleScale);
    this.grain =
      grainCount > 0 ? createSurfaceGrain(grainCount, this.beadCount, cfg.colors.grain, cfg.grainSize, rand) : null;

    this.group.add(this.beadMesh, this.rungMesh);
    if (this.grain) this.group.add(this.grain.points);
    this.group.scale.setScalar(cfg.scale);
    this.update(0, 0);
  }

  setEnvironment(env: Texture | null): void {
    this.material.envMap = env;
    this.material.needsUpdate = true;
    if (this.rungMaterial !== this.material) {
      this.rungMaterial.envMap = env;
      this.rungMaterial.needsUpdate = true;
    }
  }

  /** Analytic backbone centre for strand `s` at a frame stored in `frames[fo..fo+9]`. */
  private strandPoint(
    s: number,
    u: number,
    frames: Float32Array,
    fo: number,
    radiusMul: number,
    angleJitter: number,
    out: Float32Array,
  ): void {
    const cfg = this.cfg;
    const t = this.time;
    const ang =
      (u + this.shift) * cfg.turns * TAU +
      this.phase +
      s * cfg.strandOffset +
      angleJitter +
      cfg.twist * Math.sin(u * TAU * 1.5 + t * 0.3);
    const r = cfg.radius * radiusMul * (1 + 0.025 * Math.sin(t * 0.7 + u * 17));
    const ca = Math.cos(ang) * r + cfg.wobble * 0.6 * Math.cos(t * 0.29 + u * 3.3);
    const sa = Math.sin(ang) * r + cfg.wobble * Math.sin(t * 0.35 + u * 4.1);
    out[0] = frames[fo] + frames[fo + 3] * ca + frames[fo + 6] * sa;
    out[1] = frames[fo + 1] + frames[fo + 4] * ca + frames[fo + 7] * sa;
    out[2] = frames[fo + 2] + frames[fo + 5] * ca + frames[fo + 8] * sa;
  }

  /**
   * Advance the helix. `time` is elapsed seconds (already scaled for reduced
   * motion) — never frame counts — so motion is refresh-rate independent.
   */
  update(time: number, shift: number): void {
    const cfg = this.cfg;
    this.time = time;
    this.shift = shift;
    this.phase = cfg.phaseOffset + time * cfg.rotationSpeed;
    const th = cfg.strandThickness;
    const tmp = this.tmpA;

    /* Backbones */
    const arr = this.beadMesh.instanceMatrix.array as Float32Array;
    for (let b = 0; b < this.beadCount; b++) {
      const p = b * BEAD_STRIDE;
      this.strandPoint(
        this.beadParams[p],
        this.beadParams[p + 1],
        this.beadFrames,
        b * 9,
        1 + this.beadParams[p + 2],
        this.beadParams[p + 3],
        tmp,
      );
      const om = this.beadParams[p + 5] * th;
      const d = b * 3;
      const x = tmp[0] + this.beadDirs[d] * om;
      const y = tmp[1] + this.beadDirs[d + 1] * om;
      const z = tmp[2] + this.beadDirs[d + 2] * om;
      const sc = this.beadParams[p + 4] * th * (1 + 0.05 * Math.sin(time * 1.6 + this.beadSeeds[b] * TAU));
      this.centers[d] = x;
      this.centers[d + 1] = y;
      this.centers[d + 2] = z;
      this.radii[b] = sc;
      const m = b * 16;
      arr[m] = sc;
      arr[m + 1] = 0;
      arr[m + 2] = 0;
      arr[m + 3] = 0;
      arr[m + 4] = 0;
      arr[m + 5] = sc;
      arr[m + 6] = 0;
      arr[m + 7] = 0;
      arr[m + 8] = 0;
      arr[m + 9] = 0;
      arr[m + 10] = sc;
      arr[m + 11] = 0;
      arr[m + 12] = x;
      arr[m + 13] = y;
      arr[m + 14] = z;
      arr[m + 15] = 1;
    }
    this.beadMesh.instanceMatrix.needsUpdate = true;

    /* Rungs */
    const ra = this.rungMesh.instanceMatrix.array as Float32Array;
    const pA = this.tmpA;
    const pB = this.tmpB;
    const rt = cfg.rungThickness;
    if (cfg.rungStyle === "rod") {
      for (let r = 0; r < this.rungCount; r++) {
        this.strandPoint(0, this.rungU[r], this.rungFrames, r * 9, 1, 0, pA);
        this.strandPoint(1, this.rungU[r], this.rungFrames, r * 9, 1, 0, pB);
        const mx = (pA[0] + pB[0]) * 0.5;
        const my = (pA[1] + pB[1]) * 0.5;
        const mz = (pA[2] + pB[2]) * 0.5;
        for (let h = 0; h < 2; h++) {
          if (h === 0) {
            this.v0.set(pA[0], pA[1], pA[2]);
            this.v1.set(mx, my, mz);
          } else {
            this.v0.set(mx, my, mz);
            this.v1.set(pB[0], pB[1], pB[2]);
          }
          const len = this.v0.distanceTo(this.v1);
          this.v1.sub(this.v0);
          if (len > 1e-5) this.v1.divideScalar(len);
          this.q.setFromUnitVectors(this.up, this.v1);
          this.v0.addScaledVector(this.v1, len * 0.5);
          this.vs.set(rt, len * 1.02, rt);
          this.m4.compose(this.v0, this.q, this.vs);
          this.m4.toArray(ra, (r * 2 + h) * 16);
        }
      }
    } else {
      let lastR = -1;
      for (let k = 0; k < this.rungBeadCount; k++) {
        const p = k * RUNG_BEAD_STRIDE;
        const r = this.rungBeadParams[p];
        if (r !== lastR) {
          this.strandPoint(0, this.rungU[r], this.rungFrames, r * 9, 1, 0, pA);
          this.strandPoint(1, this.rungU[r], this.rungFrames, r * 9, 1, 0, pB);
          lastR = r;
        }
        const t = this.rungBeadParams[p + 1];
        const j = this.rungBeadParams[p + 3] * rt;
        const d = k * 3;
        const x = pA[0] + (pB[0] - pA[0]) * t + this.rungBeadDirs[d] * j;
        const y = pA[1] + (pB[1] - pA[1]) * t + this.rungBeadDirs[d + 1] * j;
        const z = pA[2] + (pB[2] - pA[2]) * t + this.rungBeadDirs[d + 2] * j;
        const sc = rt * this.rungBeadParams[p + 2] * (0.75 + 0.35 * Math.sin(Math.PI * t));
        const m = k * 16;
        ra.fill(0, m, m + 16);
        ra[m] = sc;
        ra[m + 5] = sc;
        ra[m + 10] = sc;
        ra[m + 12] = x;
        ra[m + 13] = y;
        ra[m + 14] = z;
        ra[m + 15] = 1;
      }
    }
    this.rungMesh.instanceMatrix.needsUpdate = true;

    if (this.grain) {
      this.grain.update(this.centers, this.radii);
      this.grain.material.uniforms.uTime.value = time;
    }
  }

  /**
   * Writes the current backbone centre-lines (local space) of both strands
   * into `out` — layout: [strand0 samples..., strand1 samples...] × xyz.
   */
  sampleCenterlines(out: Float32Array): void {
    const tmp = this.tmpA;
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < this.pinSamples; i++) {
        this.strandPoint(s, this.pinU[i], this.pinFrames, i * 9, 1, 0, tmp);
        const o = (s * this.pinSamples + i) * 3;
        out[o] = tmp[0];
        out[o + 1] = tmp[1];
        out[o + 2] = tmp[2];
      }
    }
  }

  dispose(): void {
    this.sphere.dispose();
    this.cylinder?.dispose();
    this.material.dispose();
    if (this.rungMaterial !== this.material) this.rungMaterial.dispose();
    this.beadMesh.dispose();
    this.rungMesh.dispose();
    this.grain?.dispose();
  }
}
