import { FixedStepLoop } from "./game/loop";
import { GestureRecognizer } from "./input/gestures";
import { attachTouch } from "./input/touch";
import { frameFor, loadCarSprites } from "./render/sprites";
import { CAR } from "./shared/tuning";
import { createState } from "./sim/state";
import { step } from "./sim/step";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D not available");

const sprites = await loadCarSprites();
const gestures = new GestureRecognizer();
let steerView = 0;
attachTouch(canvas, gestures);

let state = createState();
let prev = state;
let now = performance.now();
const loop = new FixedStepLoop((dt) => {
  prev = state;
  const intent = gestures.sample(now, dt * 1000);
  steerView = intent.steer;
  state = step(state, intent, dt);
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
  draw(alpha);
  requestAnimationFrame(frame);
};

/** M0 placeholder: flat road with scrolling stripes and a square car. */
const draw = (alpha: number) => {
  const w = canvas.width;
  const h = canvas.height;
  const car = state.car;
  const pcar = prev.car;
  const s = pcar.s + (car.s - pcar.s) * alpha;
  const x = pcar.x + (car.x - pcar.x) * alpha;

  ctx.fillStyle = "#1f8a4c";
  ctx.fillRect(0, 0, w, h);
  const roadW = w * 0.7;
  const roadX = (w - roadW) / 2;
  ctx.fillStyle = "#3a3a52";
  ctx.fillRect(roadX, 0, roadW, h);
  ctx.fillStyle = "#e8e8f0";
  const seg = h / 8;
  const off = (s * 0.6) % (seg * 2);
  for (let y = -seg * 2 + off; y < h; y += seg * 2) {
    ctx.fillRect(w / 2 - w * 0.01, y, w * 0.02, seg);
  }
  const cx = w / 2 + x * (roadW / 2);
  sprites.draw(ctx, "player", frameFor(steerView), cx, h * 0.86, Math.round(w * 0.26));

  ctx.fillStyle = "#fff";
  ctx.font = `${Math.round(w * 0.04)}px monospace`;
  const nitro = "●".repeat(car.nitroCharges).padEnd(CAR.nitroCharges, "○");
  ctx.fillText(`${Math.round(car.v)} km/h  nitro ${nitro}`, 12, 28);
  ctx.fillText(`${gestures.state}  ${Math.round(fps)} fps`, 12, 56);
};

requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
