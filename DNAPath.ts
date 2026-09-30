import { CatmullRomCurve3, Vector3 } from "three";
import type { Vec3Tuple } from "./DNAConfig";

/**
 * A spline sampled at uniform arc-length with a rotation-minimising
 * (parallel transport) frame at every sample. Parallel transport avoids the
 * sudden flips of classic Frenet frames at inflection points, so the helix
 * wraps smoothly around arbitrarily curved paths.
 */
export interface SampledPath {
  count: number;
  length: number;
  points: Float32Array;
  tangents: Float32Array;
  normals: Float32Array;
  binormals: Float32Array;
}

export function buildCurve(control: Vec3Tuple[], curvature = 1, tension = 0.5): CatmullRomCurve3 {
  const first = new Vector3(...control[0]);
  const last = new Vector3(...control[control.length - 1]);
  const n = control.length - 1;
  const pts = control.map((c, i) => {
    const onLine = first.clone().lerp(last, i / n);
    return onLine.lerp(new Vector3(...c), curvature);
  });
  return new CatmullRomCurve3(pts, false, "catmullrom", tension);
}

export function samplePath(curve: CatmullRomCurve3, count: number): SampledPath {
  const points = new Float32Array(count * 3);
  const tangents = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const binormals = new Float32Array(count * 3);

  const p = new Vector3();
  const t = new Vector3();
  const prevT = new Vector3();
  const n = new Vector3();
  const b = new Vector3();
  const axis = new Vector3();

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t).normalize();

    if (i === 0) {
      // Seed normal: the world axis least aligned with the tangent.
      const ax = Math.abs(t.x);
      const ay = Math.abs(t.y);
      const az = Math.abs(t.z);
      const seed =
        ax <= ay && ax <= az ? new Vector3(1, 0, 0) : ay <= az ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
      n.crossVectors(t, seed).cross(t).normalize().negate();
    } else {
      axis.crossVectors(prevT, t);
      const len = axis.length();
      if (len > 1e-6) {
        axis.divideScalar(len);
        const angle = Math.acos(Math.min(Math.max(prevT.dot(t), -1), 1));
        n.applyAxisAngle(axis, angle);
      }
      // Re-orthogonalise to kill accumulated drift.
      n.sub(t.clone().multiplyScalar(n.dot(t))).normalize();
    }
    b.crossVectors(t, n).normalize();

    points.set([p.x, p.y, p.z], i * 3);
    tangents.set([t.x, t.y, t.z], i * 3);
    normals.set([n.x, n.y, n.z], i * 3);
    binormals.set([b.x, b.y, b.z], i * 3);
    prevT.copy(t);
  }

  return { count, length: curve.getLength(), points, tangents, normals, binormals };
}

/**
 * Interpolated frame lookup at arbitrary u (0..1). Writes position, normal
 * and binormal into `out` at `offset` (9 floats).
 */
export function frameAt(path: SampledPath, u: number, out: Float32Array, offset: number): void {
  const f = Math.min(Math.max(u, 0), 1) * (path.count - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(i0 + 1, path.count - 1);
  const k = f - i0;
  const a = i0 * 3;
  const c = i1 * 3;
  for (let j = 0; j < 3; j++) {
    out[offset + j] = path.points[a + j] + (path.points[c + j] - path.points[a + j]) * k;
  }
  let nx = path.normals[a] + (path.normals[c] - path.normals[a]) * k;
  let ny = path.normals[a + 1] + (path.normals[c + 1] - path.normals[a + 1]) * k;
  let nz = path.normals[a + 2] + (path.normals[c + 2] - path.normals[a + 2]) * k;
  let l = Math.hypot(nx, ny, nz) || 1;
  nx /= l;
  ny /= l;
  nz /= l;
  let bx = path.binormals[a] + (path.binormals[c] - path.binormals[a]) * k;
  let by = path.binormals[a + 1] + (path.binormals[c + 1] - path.binormals[a + 1]) * k;
  let bz = path.binormals[a + 2] + (path.binormals[c + 2] - path.binormals[a + 2]) * k;
  l = Math.hypot(bx, by, bz) || 1;
  bx /= l;
  by /= l;
  bz /= l;
  out[offset + 3] = nx;
  out[offset + 4] = ny;
  out[offset + 5] = nz;
  out[offset + 6] = bx;
  out[offset + 7] = by;
  out[offset + 8] = bz;
}
