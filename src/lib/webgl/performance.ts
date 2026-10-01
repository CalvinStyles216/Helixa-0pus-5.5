/**
 * Adaptive resolution governor. Tracks a smoothed frame time and lowers the
 * renderer pixel ratio when the device cannot keep up, restoring it slowly
 * when headroom returns.
 */
export class AdaptiveResolution {
  private avg = 16.7;
  private cooldown = 0;
  current: number;

  constructor(
    private readonly max: number,
    private readonly min = 0.75,
  ) {
    this.current = max;
  }

  /** Returns true when the pixel ratio changed. */
  sample(dt: number): boolean {
    const ms = dt * 1000;
    this.avg += (ms - this.avg) * 0.05;
    this.cooldown -= dt;
    if (this.cooldown > 0) return false;
    if (this.avg > 26 && this.current > this.min) {
      this.current = Math.max(this.min, this.current - 0.2);
      this.cooldown = 2;
      return true;
    }
    if (this.avg < 15 && this.current < this.max) {
      this.current = Math.min(this.max, this.current + 0.1);
      this.cooldown = 4;
      return true;
    }
    return false;
  }
}
