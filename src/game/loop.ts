import { SIM_DT } from "../shared/tuning";

export const MAX_FRAME_MS = 250;
export const MAX_STEPS_PER_FRAME = 5;

/**
 * Fixed-timestep accumulator. Call `advance(frameMs)` every rendered frame; it runs
 * `onStep` zero or more times and returns the interpolation alpha for rendering.
 */
export class FixedStepLoop {
  private acc = 0;

  constructor(
    private readonly onStep: (dt: number) => void,
    private readonly dt = SIM_DT,
  ) {}

  advance(frameMs: number): number {
    this.acc += Math.min(frameMs, MAX_FRAME_MS) / 1000;
    let steps = 0;
    while (this.acc >= this.dt && steps < MAX_STEPS_PER_FRAME) {
      this.onStep(this.dt);
      this.acc -= this.dt;
      steps += 1;
    }
    if (steps === MAX_STEPS_PER_FRAME) this.acc = 0;
    return this.acc / this.dt;
  }
}
