import { curvatureAt, elevationAt } from "../track/track";

/**
 * Pseudo-3D road: classic segment projection (near to far, with hill clipping), drawn into a
 * low-res internal canvas and upscaled with hard pixels. Supports curves and hills, with
 * distance fog for depth.
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
const ROAD_HALF = 1000;
const SEG = 20;
const DRAW_SEGS = 230;
/** z at which a flat road reaches the bottom edge of the screen */
const Z_BOTTOM = 60;
const CAM_H = 700;
/** road half-width at the bottom of the screen, as a fraction of screen width */
const BOTTOM_HALF = 0.62;
const CURVE_UNIT = 4.2;
const FOG = [74, 30, 118] as const;
const FOG_MAX = 0.72;

type RGB = readonly [number, number, number];
const rgb = (hex: string): RGB => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const PAL = {
  asphalt: [rgb("#2c3f40"), rgb("#35494a")],
  rumbleA: rgb("#d83a3a"),
  rumbleB: rgb("#f2f2f4"),
  grass: [rgb("#1f8a4c"), rgb("#1a7a42")],
  lane: rgb("#e8e8f0"),
} as const;

const fogged = (c: RGB, f: number): string => {
  const r = Math.round(c[0] + (FOG[0] - c[0]) * f);
  const g = Math.round(c[1] + (FOG[1] - c[1]) * f);
  const b = Math.round(c[2] + (FOG[2] - c[2]) * f);
  return `rgb(${r},${g},${b})`;
};

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
  const F = ((h - hor) * Z_BOTTOM) / CAM_H;
  const G = (w * BOTTOM_HALF * Z_BOTTOM) / ROAD_HALF;
  const camXw = camX * ROAD_HALF;
  const camY = CAM_H + elevationAt(s);

  const baseIdx = Math.floor(s / SEG);
  const basePct = (s - baseIdx * SEG) / SEG;

  // ground under the whole road area, so nothing shows through between segments
  ctx.fillStyle = fogged(PAL.grass[0], FOG_MAX);
  ctx.fillRect(0, hor, w, h - hor);

  let dx = -curvatureAt(baseIdx * SEG) * basePct * CURVE_UNIT;
  let x = 0;
  let maxY = h;

  for (let n = 0; n < DRAW_SEGS; n++) {
    const idx = baseIdx + n;
    const z1 = Math.max(1, n * SEG - basePct * SEG);
    const z2 = (n + 1) * SEG - basePct * SEG;
    const x1 = x;
    x += dx;
    dx += curvatureAt(idx * SEG) * CURVE_UNIT;
    const x2 = x;

    const y1 = hor + ((camY - elevationAt(idx * SEG)) * F) / z1;
    const y2 = hor + ((camY - elevationAt((idx + 1) * SEG)) * F) / z2;
    if (z1 <= 1 && n > 0) continue;
    if (y2 >= y1 || y2 >= maxY) continue; // back side of a hill, or hidden by a nearer crest

    const c1 = w / 2 + ((x1 - camXw) * G) / z1;
    const c2 = w / 2 + ((x2 - camXw) * G) / z2;
    const half1 = (ROAD_HALF * G) / z1;
    const half2 = (ROAD_HALF * G) / z2;

    const group = Math.floor(idx / 2);
    const p = group & 1;
    const fog = Math.min(1, n / DRAW_SEGS) ** 1.5 * FOG_MAX;
    const grass = fogged(PAL.grass[p] as RGB, fog);
    const asphalt = fogged(PAL.asphalt[p] as RGB, fog);
    const rumble = fogged(p ? PAL.rumbleA : PAL.rumbleB, fog);
    const lane = fogged(PAL.lane, fog);
    const dash = (group & 3) < 2;

    const yStart = Math.max(hor, Math.ceil(y2));
    const yEnd = Math.min(Math.ceil(maxY) - 1, Math.ceil(y1) - 1);
    for (let y = yStart; y <= yEnd; y++) {
      const t = (y - y2) / (y1 - y2);
      const cx = c2 + (c1 - c2) * t;
      const half = half2 + (half1 - half2) * t;
      ctx.fillStyle = grass;
      ctx.fillRect(0, y, w, 1);
      const rw = half * 0.16;
      ctx.fillStyle = rumble;
      ctx.fillRect(cx - half - rw, y, rw, 1);
      ctx.fillRect(cx + half, y, rw, 1);
      ctx.fillStyle = asphalt;
      ctx.fillRect(cx - half, y, half * 2, 1);
      if (dash) {
        ctx.fillStyle = lane;
        const lw = Math.max(1, half * 0.03);
        ctx.fillRect(cx - half / 3 - lw / 2, y, lw, 1);
        ctx.fillRect(cx + half / 3 - lw / 2, y, lw, 1);
      }
    }
    maxY = y2;
  }
};

export const roadBottomHalf = (w: number): number => w * BOTTOM_HALF;
