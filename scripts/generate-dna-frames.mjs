import fs from "node:fs";
import path from "node:path";
import jpeg from "jpeg-js";

const TOTAL_FRAMES = 116;
const WIDTH = 960;
const HEIGHT = 540;
const OUT_DIR = path.resolve(process.cwd(), "public/assets/dna-frames");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`Generating ${TOTAL_FRAMES} DNA frames into ${OUT_DIR}...`);

// Color helper
function rgb(r, g, b) {
  return [Math.max(0, Math.min(255, Math.round(r))), Math.max(0, Math.min(255, Math.round(g))), Math.max(0, Math.min(255, Math.round(b)))];
}

// Generate static ambient background particles
const NUM_PARTICLES = 160;
const particles = [];
let seed = 42;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push({
    x: (random() - 0.5) * 1.8 * WIDTH,
    y: (random() - 0.5) * 1.8 * HEIGHT,
    z: random() * 400 - 200,
    radius: random() * 1.8 + 0.6,
    alpha: random() * 0.4 + 0.15,
    speed: random() * 0.5 + 0.5,
  });
}

// Render loop
for (let frameIdx = 0; frameIdx < TOTAL_FRAMES; frameIdx++) {
  const tProgress = frameIdx / TOTAL_FRAMES;
  const rotationAngle = tProgress * Math.PI * 2;

  // Frame buffer (RGBA)
  const buffer = Buffer.alloc(WIDTH * HEIGHT * 4);

  // 1. Draw rich background gradient (deep navy / bioluminescent vignette)
  // Matching Hero palette: #0b1a30 to #1d3d6e with center-right cyan ambient light
  for (let y = 0; y < HEIGHT; y++) {
    const ny = y / HEIGHT;
    for (let x = 0; x < WIDTH; x++) {
      const nx = x / WIDTH;
      // Distance from glow center (slightly right of center, where the DNA helix sits)
      const dx = nx - 0.55;
      const dy = ny - 0.48;
      const dist = Math.sqrt(dx * dx * 1.6 + dy * dy);

      const glow = Math.max(0, 1 - dist * 1.3);
      const r = Math.round(10 + 20 * glow + 10 * (1 - ny));
      const g = Math.round(24 + 48 * glow + 25 * (1 - ny));
      const b = Math.round(52 + 95 * glow + 55 * (1 - ny));

      const idx = (y * WIDTH + x) * 4;
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = 255;
    }
  }

  // Draw buffer helper with blending
  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || a <= 0) return;
    const idx = (y * WIDTH + x) * 4;
    const prevR = buffer[idx];
    const prevG = buffer[idx + 1];
    const prevB = buffer[idx + 2];
    const invA = 1 - a;
    buffer[idx] = Math.round(prevR * invA + r * a);
    buffer[idx + 1] = Math.round(prevG * invA + g * a);
    buffer[idx + 2] = Math.round(prevB * invA + b * a);
  }

  function drawGlowCircle(cx, cy, radius, r, g, b, peakAlpha, glowFactor = 2.4) {
    const minX = Math.max(0, Math.floor(cx - radius * glowFactor));
    const maxX = Math.min(WIDTH - 1, Math.ceil(cx + radius * glowFactor));
    const minY = Math.max(0, Math.floor(cy - radius * glowFactor));
    const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + radius * glowFactor));

    for (let py = minY; py <= maxY; py++) {
      const dy = py - cy;
      for (let px = minX; px <= maxX; px++) {
        const dx = px - cx;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > radius * glowFactor) continue;

        let alpha = 0;
        if (d <= radius) {
          const coreDist = d / radius;
          alpha = peakAlpha * (1 - coreDist * 0.4);
        } else {
          const glowDist = (d - radius) / (radius * (glowFactor - 1));
          alpha = peakAlpha * 0.6 * Math.pow(1 - glowDist, 2.5);
        }
        setPixel(px, py, r, g, b, alpha);
      }
    }
  }

  function drawLine(x0, y0, x1, y1, r, g, b, a, width = 1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const steps = Math.ceil(len * 1.5);
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const px = x0 + dx * u;
      const py = y0 + dy * u;
      drawGlowCircle(px, py, width, r, g, b, a, 1.8);
    }
  }

  // 2. Draw ambient particles with z-sorting
  for (const p of particles) {
    const angleOffset = p.speed * rotationAngle;
    const px = WIDTH * 0.55 + p.x + Math.sin(angleOffset) * 15;
    const py = HEIGHT * 0.5 + p.y + Math.cos(angleOffset * 0.7) * 10;
    const z = p.z + Math.sin(angleOffset) * 20;
    const scale = 350 / (350 + z);
    const rad = p.radius * scale;
    const alpha = p.alpha * Math.max(0.2, Math.min(1, scale));
    drawGlowCircle(px, py, rad, 120, 220, 255, alpha, 2.0);
  }

  // 3. DNA Geometry Calculation
  // 3D Helix parameters:
  const HELIX_HEIGHT = HEIGHT * 1.25;
  const HELIX_RADIUS = 105;
  const TURNS = 2.1;
  const NUM_RUNGS = 58;
  const FOV = 450;
  const CENTER_X = WIDTH * 0.55;
  const CENTER_Y = HEIGHT * 0.5;

  // We gather all 3D drawable elements (rungs and backbone spheres) to z-sort them
  const drawItems = [];

  for (let i = 0; i < NUM_RUNGS; i++) {
    const t = i / (NUM_RUNGS - 1); // 0 to 1 along helix
    const yLocal = (t - 0.5) * HELIX_HEIGHT;
    const theta = t * TURNS * Math.PI * 2 + rotationAngle;

    // Strand 1 in 3D
    const x1_3d = Math.cos(theta) * HELIX_RADIUS;
    const z1_3d = Math.sin(theta) * HELIX_RADIUS;

    // Strand 2 in 3D (180 degrees opposite)
    const x2_3d = Math.cos(theta + Math.PI) * HELIX_RADIUS;
    const z2_3d = Math.sin(theta + Math.PI) * HELIX_RADIUS;

    // Perspective projection
    const s1 = FOV / (FOV + z1_3d);
    const p1_x = CENTER_X + x1_3d * s1;
    const p1_y = CENTER_Y + yLocal * s1;

    const s2 = FOV / (FOV + z2_3d);
    const p2_x = CENTER_X + x2_3d * s2;
    const p2_y = CENTER_Y + yLocal * s2;

    const avgZ = (z1_3d + z2_3d) * 0.5;

    // Base pair types (A-T or G-C coloring)
    const isGC = i % 2 === 0;

    drawItems.push({
      type: "rung",
      z: avgZ,
      x0: p1_x,
      y0: p1_y,
      x1: p2_x,
      y1: p2_y,
      isGC,
      avgScale: (s1 + s2) * 0.5,
    });

    drawItems.push({
      type: "node1",
      z: z1_3d,
      x: p1_x,
      y: p1_y,
      scale: s1,
    });

    drawItems.push({
      type: "node2",
      z: z2_3d,
      x: p2_x,
      y: p2_y,
      scale: s2,
    });
  }

  // Sort back to front (largest z is furthest away if positive, so sort descending z)
  drawItems.sort((a, b) => b.z - a.z);

  // Render elements in depth order
  for (const item of drawItems) {
    // Depth-cue factor (0 = far away, 1 = close up)
    // z ranges from -HELIX_RADIUS to +HELIX_RADIUS
    const depthFactor = (item.z + HELIX_RADIUS) / (HELIX_RADIUS * 2); // 0 (far) to 1 (near)
    const proximity = 1 - depthFactor; // 1 (near), 0 (far)

    if (item.type === "rung") {
      const alpha = 0.35 + proximity * 0.55;
      const width = 0.9 * item.avgScale;
      // Vibrant hydrogen bond connector
      const [r, g, b] = item.isGC ? [84, 227, 247] : [100, 180, 255];
      drawLine(item.x0, item.y0, item.x1, item.y1, r, g, b, alpha, width);

      // Center hydrogen bond bead
      const midX = (item.x0 + item.x1) * 0.5;
      const midY = (item.y0 + item.y1) * 0.5;
      drawGlowCircle(midX, midY, 1.8 * item.avgScale, 210, 245, 255, alpha * 0.9, 2.5);
    } else if (item.type === "node1") {
      // Strand 1: Luminous Electric Cyan
      const baseRadius = 4.6 * item.scale;
      const alpha = 0.45 + proximity * 0.55;
      const [r, g, b] = proximity > 0.5 ? [0, 210, 255] : [60, 160, 230];
      // Core highlight
      drawGlowCircle(item.x, item.y, baseRadius, r, g, b, alpha, 2.8);
      // Hot center specular
      if (proximity > 0.4) {
        drawGlowCircle(item.x - 0.8 * item.scale, item.y - 0.8 * item.scale, baseRadius * 0.45, 255, 255, 255, alpha * 0.9, 1.4);
      }
    } else if (item.type === "node2") {
      // Strand 2: Brilliant Cobalt / Royal Azure
      const baseRadius = 4.6 * item.scale;
      const alpha = 0.45 + proximity * 0.55;
      const [r, g, b] = proximity > 0.5 ? [74, 138, 244] : [47, 99, 173];
      drawGlowCircle(item.x, item.y, baseRadius, r, g, b, alpha, 2.8);
      if (proximity > 0.4) {
        drawGlowCircle(item.x - 0.8 * item.scale, item.y - 0.8 * item.scale, baseRadius * 0.45, 255, 255, 255, alpha * 0.9, 1.4);
      }
    }
  }

  // Encode to JPEG
  const rawImageData = {
    data: buffer,
    width: WIDTH,
    height: HEIGHT,
  };
  const jpegImageData = jpeg.encode(rawImageData, 82);

  const frameFileName = `frame_${String(frameIdx + 1).padStart(4, "0")}.jpg`;
  const framePath = path.join(OUT_DIR, frameFileName);
  fs.writeFileSync(framePath, jpegImageData.data);

  if ((frameIdx + 1) % 25 === 0 || frameIdx === TOTAL_FRAMES - 1) {
    console.log(`Rendered frame ${frameIdx + 1}/${TOTAL_FRAMES}`);
  }
}

console.log("All 116 DNA frames successfully generated!");
