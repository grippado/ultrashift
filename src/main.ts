import { FixedStepLoop } from "./game/loop";
import { GestureRecognizer } from "./input/gestures";
import { attachTouch } from "./input/touch";
import { drawBrakeGlow, Fx } from "./render/fx";
import { drawRoad, drawSky, HORIZON, roadBottomHalf } from "./render/road";
import { frameFor, loadCarSprites } from "./render/sprites";
import { CAR } from "./shared/tuning";
import { createState } from "./sim/state";
import { step } from "./sim/step";
import { curvatureAt } from "./track/track";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D not available");

const sprites = await loadCarSprites();
const gestures = new GestureRecognizer();
let steerView = 0;
let brakeView = 0;
const fx = new Fx();
let bgScroll = 0;

/** Low-res internal canvas (fixed height), upscaled with hard pixels. */
const INTERNAL_H = 480;
const buf = document.createElement("canvas");
const bctx = buf.getContext("2d");
if (!bctx) throw new Error("Canvas 2D not available");
const CAM_FOLLOW = 0.7;
attachTouch(canvas, gestures);

let state = createState();
let prev = state;
let now = performance.now();
const loop = new FixedStepLoop((dt) => {
  prev = state;
  const intent = gestures.sample(now, dt * 1000);
  steerView = intent.steer;
  brakeView = intent.brake;
  state = step(state, intent, dt);
  bgScroll += curvatureAt(state.car.s) * state.car.v * dt * 0.08;
});

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
};
window.addEventListener("resize", resize);
resize();

let last = now;
let fps = 60;
const frame = (t: number) => {
  now = t;
  const ms = t - last;
  last = t;
  fps += (1000 / Math.max(ms, 1) - fps) * 0.1;
  const alpha = loop.advance(ms);
  draw(alpha, ms);
  requestAnimationFrame(frame);
};

const draw = (alpha: number, frameMs: number) => {
  const dw = canvas.width;
  const dh = canvas.height;
  const w = Math.min(720, Math.max(240, Math.round((INTERNAL_H * dw) / dh)));
  const h = INTERNAL_H;
  if (buf.width !== w || buf.height !== h) {
    buf.width = w;
    buf.height = h;
  }
  const car = state.car;
  const pcar = prev.car;
  const s = pcar.s + (car.s - pcar.s) * alpha;
  const x = pcar.x + (car.x - pcar.x) * alpha;
  const camX = x * CAM_FOLLOW;

  drawSky(bctx, w, Math.round(h * HORIZON), bgScroll);
  drawRoad(bctx, { w, h, s, camX });
  const carX = w / 2 + (x - camX) * roadBottomHalf(w);
  const bottom = h * 0.95;
  const lean = frameFor(steerView) === "center" ? 0 : Math.sign(steerView) * 3;

  const fdt = Math.min(frameMs, 50) / 1000;
  if (car.nitroLeft > 0) {
    fx.flame(carX - 17 + lean, bottom - 6, 5);
    fx.flame(carX + 17 + lean, bottom - 6, 5);
  }
  const offroad = Math.abs(x) > 1;
  if ((brakeView > 0.2 && car.v > 60) || (offroad && car.v > 40)) {
    const color = offroad ? "#c9b27a" : "#e8ecf4";
    fx.smoke(carX - 33 + lean, bottom - 3, -1, color);
    fx.smoke(carX + 33 + lean, bottom - 3, 1, color);
  }
  fx.update(fdt);

  sprites.draw(bctx, "player", frameFor(steerView), carX, bottom, 80);
  drawBrakeGlow(bctx, carX + lean, bottom, brakeView);
  fx.draw(bctx);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, dw, dh);

  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(dh * 0.022)}px monospace`;
  const nitro = "●".repeat(car.nitroCharges).padEnd(CAR.nitroCharges, "○");
  ctx.fillText(`${Math.round(car.v)} km/h  nitro ${nitro}`, 12, dh * 0.04);
  ctx.fillText(`${gestures.state}  ${Math.round(fps)} fps`, 12, dh * 0.07);
};

requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
