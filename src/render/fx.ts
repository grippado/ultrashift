import { createRng } from "../shared/rng";

type Kind = "flame" | "smoke" | "spark";

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size0: number;
  size1: number;
  color: string;
}

/** Flame ramp, hot to cool: white, cyan, yellow, orange, red. */
const FLAME = ["#ffffff", "#8ff3ff", "#19e3ff", "#ffe14a", "#ff9a2e", "#e8402a"];
const MAX_PARTICLES = 400;

/**
 * Pixel particle effects drawn in the low-res internal canvas (same palette as the sprites).
 * Rear-view logic: flames and smoke come toward the camera, so they grow and move down the screen.
 */
export class Fx {
  private ps: Particle[] = [];
  private rng = createRng(7);

  private r(a: number, b: number): number {
    return a + (b - a) * this.rng();
  }

  private add(p: Particle): void {
    if (this.ps.length >= MAX_PARTICLES) this.ps.shift();
    this.ps.push(p);
  }

  /** Nitro flame from one exhaust: a bright core that grows toward the viewer. */
  flame(x: number, y: number, count = 3): void {
    for (let i = 0; i < count; i++) {
      this.add({
        kind: "flame",
        x: x + this.r(-1.5, 1.5),
        y: y + this.r(-1, 1),
        vx: this.r(-24, 24),
        vy: this.r(40, 90),
        age: 0,
        life: this.r(0.16, 0.3),
        size0: 6,
        size1: 13,
        color: "",
      });
    }
  }

  /** Tire smoke / offroad dust at a wheel, drifting up and out. */
  smoke(x: number, y: number, side: -1 | 1, color = "#e8ecf4"): void {
    this.add({
      kind: "smoke",
      x: x + this.r(-2, 2),
      y: y + this.r(-1, 1),
      vx: side * this.r(8, 26),
      vy: this.r(-26, -6),
      age: 0,
      life: this.r(0.35, 0.65),
      size0: 3,
      size1: 11,
      color,
    });
  }

  /** Spark burst, for collisions. */
  sparks(x: number, y: number, count = 14): void {
    for (let i = 0; i < count; i++) {
      const a = this.r(0, Math.PI * 2);
      const sp = this.r(40, 140);
      this.add({
        kind: "spark",
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        age: 0,
        life: this.r(0.18, 0.4),
        size0: 2,
        size1: 1,
        color: this.rng() < 0.5 ? "#ffe14a" : "#ffffff",
      });
    }
  }

  update(dt: number): void {
    for (const p of this.ps) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "spark") p.vy += 260 * dt;
    }
    this.ps = this.ps.filter((p) => p.age < p.life);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.ps) {
      const t = p.age / p.life;
      const size = Math.max(1, Math.round(p.size0 + (p.size1 - p.size0) * t));
      const x = Math.round(p.x - size / 2);
      const y = Math.round(p.y - size / 2);
      if (p.kind === "flame") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1 - t * 0.6;
        ctx.fillStyle = FLAME[Math.min(FLAME.length - 1, Math.floor(t * FLAME.length))] as string;
      } else if (p.kind === "smoke") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = Math.max(0.15, Math.round(0.75 * (1 - t) * 4) / 4);
        ctx.fillStyle = p.color;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.color;
      }
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

/** Brake-light glow on the player's tail lights (additive, stepped for a pixel look). */
export const drawBrakeGlow = (
  ctx: CanvasRenderingContext2D,
  carX: number,
  bottom: number,
  amount: number,
): void => {
  if (amount <= 0.02) return;
  ctx.globalCompositeOperation = "lighter";
  const y = Math.round(bottom - 21);
  for (const side of [-1, 1]) {
    const cx = Math.round(carX + side * 17);
    ctx.globalAlpha = Math.min(0.55, 0.25 + amount * 0.5);
    ctx.fillStyle = "#ff3a2a";
    ctx.fillRect(cx - 9, y - 4, 18, 8);
    ctx.globalAlpha = Math.min(0.5, amount * 0.7);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(cx - 6, y - 2, 12, 4);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
