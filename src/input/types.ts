/** What the simulation understands. It never sees touch, keys or gamepads. */
export interface Intent {
  /** -1 (left) .. 1 (right) */
  steer: number;
  /** 0 .. 1 */
  brake: number;
  /** true for exactly one sample when nitro is triggered (edge) */
  nitro: boolean;
}

export const NEUTRAL_INTENT: Readonly<Intent> = { steer: 0, brake: 0, nitro: false };

export interface InputSource {
  /** Sample once per simulation tick. `nowMs` is a monotonic clock, `dtMs` the tick length. */
  sample(nowMs: number, dtMs: number): Intent;
}
