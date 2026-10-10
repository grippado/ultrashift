import { curvatureAt } from "../track/track";

/**
 * Pseudo-3D road in the style of the SNES racers: scanline projection below a high horizon.
 * Drawn into a low-res internal canvas (see main.ts), then upscaled with hard pixels.
 */
export interface RoadView {
  /** internal canvas size */
  w: number;
  h: number;
  /** distance travelled along the track */
  s: number;
  /** camera lateral position, in road half-widths */
  camX: number;
}

export const HORIZON = 0.4;
/** road half-width at the bottom of the screen, as a fraction of screen width */
const BOTTOM_HALF = 0.6;
/** world depth at the bottom scanline; far depth = NEAR_DEPTH * (h - horizon) / (y - horizon) */
const NEAR_DEPTH = 40;
const STRIPE = 36;
const CURVE_SCALE = 1e-5;

const C = {
  asphalt: ["#2c3f40", "#35494a"],
  rumbleA: "#d83a3a",
  rumbleB: "#f2f2f4",
  grass: ["#1f8a4c", "#1a7a42"],
  lane: "#e8e8f0",
} as const;

const SKY = ["#1a1040", "#2b1561", "#4a1a7a", "#7a2a8f", "#b83a8e", "#ee6a5a", "#ffa14a"];

export const drawSky = (
  ctx: CanvasRenderingContext2D,
  w: number,
  hor: number,
  scroll: number,
): void => {
  const band = Math.ceil(hor / SKY.length);
  SKY.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * band, w, band + 1);
  });
  // distant mountains, tiled and scrolled with the road heading
  ctx.fillStyle = "#1a1040";
  const period = 256;
  const off = ((scroll % period) + period) % period;
  for (let x = -off; x < w; x += period) {
    ctx.beginPath();
    ctx.moveTo(x, hor);
    const pts = [0, 10, 26, 14, 34, 18, 8, 22, 12, 30, 16, 6, 0];
    pts.forEach((p, i) => ctx.lineTo(x + (i * period) / (pts.length - 1), hor - p));
    ctx.lineTo(x + period, hor);
    ctx.closePath();
    ctx.fill();
  }
};

export const drawRoad = (ctx: CanvasRenderingContext2D, v: RoadView): void => {
  const { w, h, s, camX } = v;
  const hor = Math.round(h * HORIZON);
  const span = h - hor;
  const halfBottom = w * BOTTOM_HALF;
  const K = NEAR_DEPTH * span;

  let x = 0;
  let dx = 0;
  let dPrev = NEAR_DEPTH;
  // Start with the camera's own curvature so the road bends the moment a curve begins.
  for (let y = h - 1; y > hor; y--) {
    const dy = y - hor;
    const t = dy / span;
    const d = K / dy;
    const dd = d - dPrev;
    dPrev = d;
    dx += curvatureAt(s + d) * dd;
    x += dx * dd;

    const half = halfBottom * t;
    const cx = w / 2 + (x * CURVE_SCALE - camX) * half;
    const idx = Math.floor((s + d) / STRIPE);
    const phase = idx & 1;

    ctx.fillStyle = C.grass[phase] as string;
    ctx.fillRect(0, y, w, 1);

    const rumble = half * 0.16;
    ctx.fillStyle = phase ? C.rumbleA : C.rumbleB;
    ctx.fillRect(cx - half - rumble, y, rumble, 1);
    ctx.fillRect(cx + half, y, rumble, 1);

    ctx.fillStyle = C.asphalt[phase] as string;
    ctx.fillRect(cx - half, y, half * 2, 1);

    if ((idx & 3) < 2) {
      ctx.fillStyle = C.lane;
      const lw = Math.max(1, half * 0.03);
      ctx.fillRect(cx - half / 3 - lw / 2, y, lw, 1);
      ctx.fillRect(cx + half / 3 - lw / 2, y, lw, 1);
    }
  }
};

export const roadBottomHalf = (w: number): number => w * BOTTOM_HALF;
