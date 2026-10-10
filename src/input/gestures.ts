import { clamp, smooth } from "../shared/math";
import { GESTURE } from "../shared/tuning";
import type { InputSource, Intent } from "./types";

export interface PointerSample {
  id: number;
  x: number;
  y: number;
  /** ms, from event.timeStamp */
  t: number;
}

type Phase = "IDLE" | "PRESSED" | "STEERING" | "BRAKING";

interface LastTap {
  t: number;
  x: number;
  y: number;
}

/**
 * Pure gesture state machine: one owner pointer steers/brakes, a double tap fires nitro.
 * No DOM here; touch.ts feeds it pointer events. Brake can only start after STEERING.
 */
export class GestureRecognizer implements InputSource {
  private phase: Phase = "IDLE";
  private owner = -1;
  private downT = 0;
  private anchorX = 0;
  private anchorY = 0;
  private curX = 0;
  private curY = 0;
  private maxDistPx = 0;
  private lastTap: LastTap | null = null;
  private nitroPending = false;
  private steerOut = 0;

  constructor(private readonly cfg = GESTURE) {}

  get state(): Phase {
    return this.phase;
  }

  down(p: PointerSample): void {
    if (this.phase !== "IDLE") {
      // secondary finger: tap = immediate nitro
      if (p.id !== this.owner) this.nitroPending = true;
      return;
    }
    const lt = this.lastTap;
    if (
      lt &&
      p.t - lt.t < this.cfg.doubleTapMs &&
      Math.hypot(p.x - lt.x, p.y - lt.y) < this.cfg.doubleTapDistPx
    ) {
      this.nitroPending = true;
      this.lastTap = null;
    }
    this.phase = "PRESSED";
    this.owner = p.id;
    this.downT = p.t;
    this.anchorX = this.curX = p.x;
    this.anchorY = this.curY = p.y;
    this.maxDistPx = 0;
  }

  move(p: PointerSample): void {
    if (p.id !== this.owner || this.phase === "IDLE") return;
    this.curX = p.x;
    this.curY = p.y;
    this.maxDistPx = Math.max(this.maxDistPx, Math.hypot(p.x - this.anchorX, p.y - this.anchorY));
    if (this.phase === "PRESSED") {
      const dead = this.cfg.deadZoneMm * this.cfg.pxPerMm;
      if (this.maxDistPx > dead || p.t - this.downT >= this.cfg.commitMs) this.phase = "STEERING";
    }
    this.updateBrakePhase();
  }

  up(p: PointerSample): void {
    if (p.id !== this.owner) return;
    const isTap =
      p.t - this.downT < this.cfg.tapMaxMs &&
      this.maxDistPx < this.cfg.tapSlopMm * this.cfg.pxPerMm;
    this.lastTap = isTap ? { t: p.t, x: p.x, y: p.y } : null;
    this.reset();
  }

  cancel(): void {
    this.lastTap = null;
    this.nitroPending = false;
    this.reset();
  }

  sample(nowMs: number, dtMs: number): Intent {
    if (this.phase === "PRESSED" && nowMs - this.downT >= this.cfg.commitMs) {
      this.phase = "STEERING";
      this.updateBrakePhase();
    }
    let target = 0;
    let brake = 0;
    if (this.phase === "STEERING" || this.phase === "BRAKING") {
      const px = this.cfg.pxPerMm;
      const dx = this.curX - this.anchorX;
      const inner = this.cfg.steerInnerDeadMm * px;
      const mag = Math.max(0, Math.abs(dx) - inner);
      target = clamp((Math.sign(dx) * mag) / (this.cfg.steerRangeMm * px), -1, 1);
      if (this.phase === "BRAKING") {
        const dy = this.curY - this.anchorY;
        brake =
          clamp((dy - this.cfg.brakeStartMm * px) / (this.cfg.brakeRangeMm * px), 0, 1) *
          this.cfg.brakeMax;
        target *= this.cfg.brakeSteerWeight;
      }
    }
    const tau = this.phase === "IDLE" ? this.cfg.steerReleaseTauMs : this.cfg.steerTauMs;
    this.steerOut = smooth(this.steerOut, target, tau, dtMs);
    if (this.phase === "IDLE" && Math.abs(this.steerOut) < 0.001) this.steerOut = 0;
    const nitro = this.nitroPending;
    this.nitroPending = false;
    return { steer: this.steerOut, brake, nitro };
  }

  private updateBrakePhase(): void {
    if (this.phase !== "STEERING" && this.phase !== "BRAKING") return;
    const px = this.cfg.pxPerMm;
    const dx = this.curX - this.anchorX;
    const dy = this.curY - this.anchorY;
    if (this.phase === "STEERING") {
      if (dy > this.cfg.brakeStartMm * px && dy > this.cfg.brakeAxisRatio * Math.abs(dx)) {
        this.phase = "BRAKING";
      }
    } else if (dy < this.cfg.brakeExitMm * px) {
      this.phase = "STEERING";
    }
  }

  private reset(): void {
    this.phase = "IDLE";
    this.owner = -1;
  }
}
