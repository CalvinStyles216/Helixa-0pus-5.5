import { useEffect, useRef, type RefObject } from "react";
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { DNAConfig, DNAStageResult } from "./DNAConfig";
import { DNAHelix } from "./DNAHelix";
import { createAmbientField, mulberry32, type AmbientField } from "./DNAParticles";
import { detectQualityLevel, getQualityProfile, type QualityLevel } from "./DNAQuality";
import { DOFPass } from "./DOFPass";
import { createRenderer, subscribeTick } from "@/lib/webgl/renderer";
import { AdaptiveResolution } from "@/lib/webgl/performance";
import {
  bindPointer,
  measureScroll,
  onReducedMotionChange,
  pointer,
  prefersReducedMotion,
  type ScrollMetrics,
} from "@/lib/webgl/viewport";
import { cn } from "@/utils/cn";

export interface DNAStageApi {
  width: number;
  height: number;
  /** True when the user prefers reduced motion. */
  reduced: boolean;
  /**
   * Returns the top-most projected backbone point crossing a given x
   * coordinate (in stage CSS pixels). Continuous as the helix revolves.
   */
  topmostAtX(x: number): { x: number; y: number } | null;
}

export interface ProceduralDNAProps {
  config: DNAConfig;
  className?: string;
  /** Force a quality level (defaults to auto-detection). */
  quality?: QualityLevel;
  /** Quality level used below 768px viewport width. */
  mobileQuality?: QualityLevel;
  /** Element whose scroll position drives the choreography (defaults to the stage). */
  scrollTarget?: RefObject<HTMLElement | null>;
  /** Called every rendered frame — use refs, never React state, inside. */
  onFrame?: (api: DNAStageApi) => void;
  seed?: number;
}

export function ProceduralDNA({
  config,
  className,
  quality,
  mobileQuality = "low",
  scrollTarget,
  onFrame,
  seed = 7,
}: ProceduralDNAProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    bindPointer();

    let level: QualityLevel = quality ?? detectQualityLevel();
    if (window.innerWidth < 768) level = mobileQuality;
    const q = getQualityProfile(level);

    const canvas = document.createElement("canvas");
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 1.6s cubic-bezier(0.25, 1, 0.5, 1)";
    container.appendChild(canvas);

    const useDof = q.dof && config.dof.enabled;
    const maxDpr = Math.min(window.devicePixelRatio || 1, q.dprCap);
    const renderer = createRenderer(canvas, maxDpr, !useDof);
    if (!renderer) {
      canvas.remove();
      return;
    }
    const gl = renderer.getContext();
    const pointRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | number[] | null;
    const maxPointSize = pointRange ? Number(pointRange[1]) : 64;

    /* Scene graph */
    const scene = new Scene();
    const overlay = new Scene();
    const camera = new PerspectiveCamera(config.camera.fov, 1, 0.1, 90);
    camera.position.set(...config.camera.position);
    camera.lookAt(new Vector3(...config.camera.target));
    const baseCamDist = new Vector3(...config.camera.position).distanceTo(new Vector3(...config.camera.target));

    const L = config.lights;
    const hemi = new HemisphereLight(new Color(L.hemiSky), new Color(L.hemiGround), L.hemiIntensity);
    const key = new DirectionalLight(new Color(L.key), L.keyIntensity);
    key.position.set(...L.keyPosition);
    const rim = new DirectionalLight(new Color(L.rim), L.rimIntensity);
    rim.position.set(...L.rimPosition);
    scene.add(hemi, key, rim);
    if (config.fog) scene.fog = new Fog(new Color(config.fog.color), config.fog.near, config.fog.far);

    let envTex: Texture | null = null;
    if (q.envMap) {
      const pmrem = new PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      envTex = pmrem.fromScene(room, 0.04).texture;
      pmrem.dispose();
      (room as unknown as { dispose?: () => void }).dispose?.();
    }

    const helix = new DNAHelix(config, q, seed);
    helix.setEnvironment(envTex);
    scene.add(helix.group);

    let ambient: AmbientField | null = null;
    if (config.ambient) {
      ambient = createAmbientField(config.ambient, q.particleScale, mulberry32(seed + 101));
      (useDof ? overlay : scene).add(ambient.group);
    }
    const pointMaterials = [...(helix.grain ? [helix.grain.material] : []), ...(ambient?.materials ?? [])];

    const dof = useDof ? new DOFPass(q.dofSamples, q.msaa) : null;
    const adaptive = new AdaptiveResolution(maxDpr, Math.min(1, maxDpr));

    /* Sizing */
    let width = 1;
    let height = 1;
    let pr = maxDpr;
    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(pr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      dof?.setSize(width * pr, height * pr);
      const scale = (height * pr * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
      for (const m of pointMaterials) {
        m.uniforms.uScale.value = scale;
        m.uniforms.uMaxPoint.value = Math.min(maxPointSize, 220 * pr);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* Visibility-aware activation */
    let active = false;
    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(container);

    let reduced = prefersReducedMotion();
    const offReduced = onReducedMotionChange((r) => (reduced = r));

    /* Anchor projection for DOM callouts */
    const lineBuf = new Float32Array(helix.pinSamples * 2 * 3);
    const screenBuf = new Float32Array(helix.pinSamples * 2 * 2);
    const pv = new Vector3();
    let projectedAt = -1;
    let frame = 0;
    const ensureProjected = () => {
      if (projectedAt === frame) return;
      projectedAt = frame;
      helix.group.updateMatrixWorld();
      camera.updateMatrixWorld();
      helix.sampleCenterlines(lineBuf);
      const n = helix.pinSamples * 2;
      for (let i = 0; i < n; i++) {
        pv.set(lineBuf[i * 3], lineBuf[i * 3 + 1], lineBuf[i * 3 + 2])
          .applyMatrix4(helix.group.matrixWorld)
          .project(camera);
        screenBuf[i * 2] = (pv.x * 0.5 + 0.5) * width;
        screenBuf[i * 2 + 1] = (-pv.y * 0.5 + 0.5) * height;
      }
    };
    const api: DNAStageApi = {
      width,
      height,
      reduced,
      topmostAtX(x) {
        ensureProjected();
        let best = Infinity;
        const M = helix.pinSamples;
        for (let s = 0; s < 2; s++) {
          for (let i = 0; i < M - 1; i++) {
            const a = (s * M + i) * 2;
            const x0 = screenBuf[a];
            const x1 = screenBuf[a + 2];
            if (x0 === x1 || (x0 - x) * (x1 - x) > 0) continue;
            const t = (x - x0) / (x1 - x0);
            const y = screenBuf[a + 1] + (screenBuf[a + 3] - screenBuf[a + 1]) * t;
            if (y < best) best = y;
          }
        }
        return Number.isFinite(best) ? { x, y: best } : null;
      },
    };

    /* Main loop */
    let time = 0;
    let firstFrame = true;
    const smooth = { x: 0, y: 0 };
    const metrics: ScrollMetrics = { progress: 0, enter: 0, exit: 0 };
    const scrollEl = () => scrollTarget?.current ?? container;

    const renderFrame = (dt: number) => {
      frame++;
      time += dt * (reduced ? 0.06 : 1);
      const k = reduced ? 0 : 1 - Math.exp(-dt * 2.4);
      smooth.x += (pointer.x - smooth.x) * k;
      smooth.y += (pointer.y - smooth.y) * k;
      measureScroll(scrollEl().getBoundingClientRect(), window.innerHeight, metrics);

      const res: DNAStageResult | void = config.stage?.({
        group: helix.group,
        camera,
        ambient: ambient?.group ?? null,
        progress: metrics.progress,
        enter: metrics.enter,
        exit: metrics.exit,
        pointer: smooth,
        time,
        width,
        height,
        aspect: width / height,
      });
      helix.update(time, res && res.shift ? res.shift : 0);

      const distRatio = camera.position.distanceTo(new Vector3(...config.camera.target)) / baseCamDist;
      const focus = config.dof.focusDistance * distRatio;
      const range = config.dof.focusRange * distRatio;
      for (const m of pointMaterials) {
        m.uniforms.uTime.value = time;
        m.uniforms.uFocus.value = focus;
        m.uniforms.uRange.value = range;
        m.uniforms.uFogNear.value = config.fog ? config.fog.near * distRatio : 100;
        m.uniforms.uFogFar.value = config.fog ? config.fog.far * distRatio : 200;
      }
      if (helix.grain) helix.grain.material.uniforms.uMaxBlur.value = useDof ? 0 : config.dof.maxBlur * pr * 0.5;
      if (ambient) for (const m of ambient.materials) m.uniforms.uMaxBlur.value = config.dof.maxBlur * pr * 0.9;

      if (dof) {
        dof.render(renderer, scene, camera, focus, range, config.dof.maxBlur * pr);
        renderer.render(overlay, camera);
      } else {
        renderer.clear(true, true, false);
        renderer.render(scene, camera);
        renderer.render(overlay, camera);
      }

      if (firstFrame) {
        firstFrame = false;
        requestAnimationFrame(() => (canvas.style.opacity = "1"));
      }
      api.width = width;
      api.height = height;
      api.reduced = reduced;
      onFrameRef.current?.(api);
    };

    const unsubscribe = subscribeTick((dt) => {
      if (!active || document.hidden) return;
      if (adaptive.sample(dt)) {
        pr = adaptive.current;
        resize();
      }
      renderFrame(dt);
    });

    return () => {
      unsubscribe();
      ro.disconnect();
      io.disconnect();
      offReduced();
      helix.dispose();
      ambient?.dispose();
      dof?.dispose();
      envTex?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // Config objects are static module-level presets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, quality, mobileQuality, seed]);

  return <div ref={containerRef} aria-hidden="true" className={cn("webgl-stage pointer-events-none", className)} />;
}
