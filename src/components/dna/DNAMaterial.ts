import {
  AdditiveBlending,
  Color,
  MeshPhysicalMaterial,
  NormalBlending,
  ShaderMaterial,
  type IUniform,
} from "three";

export interface CrystalMaterialOptions {
  roughness: number;
  clearcoat: number;
  emissive: string;
  emissiveIntensity: number;
  rim: string;
  rimStrength: number;
  rimPower: number;
  transmission: number;
  transmissionColor: string;
  opacity: number;
  envIntensity: number;
}

/**
 * Wet, crystalline biological material. MeshPhysicalMaterial (clearcoat +
 * soft specular) extended with a Fresnel rim and a cheap "fake transmission"
 * term that lets the backdrop tone bleed into the core of every bead, which
 * reads as translucency without the cost of a transmission render pass.
 */
export function createCrystalMaterial(o: CrystalMaterialOptions): MeshPhysicalMaterial {
  const mat = new MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: o.roughness,
    metalness: 0,
    clearcoat: o.clearcoat,
    clearcoatRoughness: 0.12,
    emissive: new Color(o.emissive),
    emissiveIntensity: o.emissiveIntensity,
    envMapIntensity: o.envIntensity,
    sheen: 0.4,
    sheenRoughness: 0.5,
    sheenColor: new Color(o.rim),
    transparent: o.opacity < 1,
    opacity: o.opacity,
  });

  const uniforms: Record<string, IUniform> = {
    uRimColor: { value: new Color(o.rim) },
    uRimStrength: { value: o.rimStrength },
    uRimPower: { value: o.rimPower },
    uTransmission: { value: o.transmission },
    uTransmissionColor: { value: new Color(o.transmissionColor) },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uRimColor;
        uniform float uRimStrength;
        uniform float uRimPower;
        uniform float uTransmission;
        uniform vec3 uTransmissionColor;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        vec3 hxViewDir = normalize(vViewPosition);
        float hxFacing = clamp(abs(dot(normalize(normal), hxViewDir)), 0.0, 1.0);
        float hxFresnel = pow(1.0 - hxFacing, uRimPower);
        totalEmissiveRadiance += uRimColor * hxFresnel * uRimStrength;`,
      )
      .replace(
        "#include <fog_fragment>",
        `gl_FragColor.rgb = mix(gl_FragColor.rgb, uTransmissionColor, pow(hxFacing, 2.0) * uTransmission * 0.55);
        #include <fog_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => "helixa-crystal";
  return mat;
}

export interface PointMaterialOptions {
  color: string;
  opacity: number;
  /** "grain" = soft glowing microspheres, "bubble" = ring-shaped droplets. */
  kind: "grain" | "bubble";
  drift: number;
  additive?: boolean;
}

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  uniform float uFocus;
  uniform float uRange;
  uniform float uMaxBlur;
  uniform float uMaxPoint;
  uniform float uDrift;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying float vSoft;
  varying float vSeed;
  void main() {
    vec3 p = position;
    float s = aSeed * 6.2831;
    p += vec3(
      sin(uTime * (0.11 + aSeed * 0.12) + s) * 0.6,
      sin(uTime * (0.08 + aSeed * 0.1) + s * 1.7) * 0.8 + uTime * 0.02 * (aSeed - 0.3),
      cos(uTime * (0.07 + aSeed * 0.09) + s * 2.3) * 0.5
    ) * uDrift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(-mv.z, 0.1);
    float px = aSize * uScale / dist;
    float coc = clamp((abs(dist - uFocus) - uRange * 0.1) / uRange, 0.0, 1.0);
    float blurPx = coc * uMaxBlur;
    gl_PointSize = clamp(px + blurPx, 1.0, uMaxPoint);
    float energy = px / (px + blurPx + 0.0001);
    float fog = 1.0 - smoothstep(uFogNear, uFogFar, dist);
    vAlpha = max(energy * energy, 0.06) * mix(0.25, 1.0, fog) * clamp(px * 0.9, 0.15, 1.0);
    vSoft = coc;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying float vAlpha;
  varying float vSoft;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float d = length(c);
    if (d > 1.0) discard;
    #ifdef BUBBLE
      float edge = mix(0.08, 0.5, vSoft);
      float ring = smoothstep(1.0 - edge - 0.22, 1.0 - edge * 0.4, d) * (1.0 - smoothstep(1.0 - edge * 0.4, 1.0, d));
      float fill = 0.12 * (1.0 - d);
      float spec = smoothstep(0.28, 0.0, length(c - vec2(-0.35, -0.38))) * (1.0 - vSoft);
      float a = (ring * 0.75 + fill + spec * 0.9);
      vec3 col = uColor + spec * 0.4;
    #else
      float edge = mix(0.35, 1.0, vSoft);
      float a = 1.0 - smoothstep(1.0 - edge, 1.0, d);
      float core = exp(-d * d * 5.0) * (1.0 - vSoft * 0.7);
      float twinkle = 0.8 + 0.2 * sin(uTime * (1.2 + vSeed * 2.0) + vSeed * 40.0);
      a *= twinkle;
      vec3 col = uColor + core * 0.25;
    #endif
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`;

export function createPointMaterial(o: PointMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 400 },
      uFocus: { value: 16 },
      uRange: { value: 8 },
      uMaxBlur: { value: 0 },
      uMaxPoint: { value: 128 },
      uDrift: { value: o.drift },
      uFogNear: { value: 100 },
      uFogFar: { value: 200 },
      uColor: { value: new Color(o.color) },
      uOpacity: { value: o.opacity },
    },
    defines: o.kind === "bubble" ? { BUBBLE: "" } : {},
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: o.additive ? AdditiveBlending : NormalBlending,
  });
}
