import {
  DepthTexture,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UnsignedIntType,
  Vector2,
  WebGLRenderTarget,
  type PerspectiveCamera,
  type WebGLRenderer,
} from "three";

/**
 * Lightweight physically-motivated depth of field.
 *
 * The scene is rendered into an offscreen target with a depth texture. A
 * single full-screen pass then gathers samples along a golden-angle spiral.
 * Each sample contributes only if its own circle of confusion reaches the
 * current pixel, and samples *behind* the pixel are clamped to the pixel's
 * own blur — so sharp foreground crossings stay crisp while background
 * geometry melts softly, and blurred foreground spills over sharp regions.
 */
export class DOFPass {
  readonly target: WebGLRenderTarget;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: ShaderMaterial;
  private readonly quad: Mesh;

  constructor(samples: number, msaa: number) {
    this.target = new WebGLRenderTarget(1, 1, { samples: msaa, depthBuffer: true });
    this.target.depthTexture = new DepthTexture(1, 1, UnsignedIntType);

    this.material = new ShaderMaterial({
      defines: { SAMPLES: Math.max(4, samples) },
      uniforms: {
        tColor: { value: this.target.texture },
        tDepth: { value: this.target.depthTexture },
        uTexel: { value: new Vector2(1, 1) },
        uNear: { value: 0.1 },
        uFar: { value: 100 },
        uFocus: { value: 15 },
        uRange: { value: 5 },
        uMaxBlur: { value: 16 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tColor;
        uniform sampler2D tDepth;
        uniform vec2 uTexel;
        uniform float uNear;
        uniform float uFar;
        uniform float uFocus;
        uniform float uRange;
        uniform float uMaxBlur;
        varying vec2 vUv;

        float linearDepth(float d) {
          float z = d * 2.0 - 1.0;
          return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));
        }
        float cocFor(float z) {
          return clamp((abs(z - uFocus) - uRange * 0.12) / uRange, 0.0, 1.0) * uMaxBlur;
        }

        void main() {
          vec4 base = texture2D(tColor, vUv);
          float zc = linearDepth(texture2D(tDepth, vUv).x);
          float cc = cocFor(zc);
          vec4 acc = base;
          float wsum = 1.0;
          const float GOLDEN = 2.39996323;
          for (int i = 0; i < SAMPLES; i++) {
            float fi = float(i) + 0.5;
            float r = sqrt(fi / float(SAMPLES)) * uMaxBlur;
            float a = fi * GOLDEN;
            vec2 uv = vUv + vec2(cos(a), sin(a)) * r * uTexel;
            float zs = linearDepth(texture2D(tDepth, uv).x);
            float cs = cocFor(zs);
            float reach = zs < zc ? cs : min(cs, cc);
            float w = clamp(reach - r + 1.0, 0.0, 1.0);
            acc += texture2D(tColor, uv) * w;
            wsum += w;
          }
          gl_FragColor = acc / wsum;
        }
      `,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      transparent: false,
    });

    this.quad = new Mesh(new PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  setSize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    this.target.setSize(w, h);
    (this.material.uniforms.uTexel.value as Vector2).set(1 / w, 1 / h);
  }

  render(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: PerspectiveCamera,
    focus: number,
    range: number,
    maxBlurPx: number,
  ): void {
    const u = this.material.uniforms;
    u.uNear.value = camera.near;
    u.uFar.value = camera.far;
    u.uFocus.value = focus;
    u.uRange.value = range;
    u.uMaxBlur.value = maxBlurPx;

    renderer.setRenderTarget(this.target);
    renderer.clear(true, true, false);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.clear(true, true, false);
    renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.target.depthTexture?.dispose();
    this.target.dispose();
    this.material.dispose();
    (this.quad.geometry as PlaneGeometry).dispose();
  }
}
