import type { Intent } from "../input/types";
import { clamp } from "../shared/math";
import { CAR } from "../shared/tuning";
import type { SimState } from "./state";

/**
 * Pure simulation step: (state, intent, dt) -> new state.
 * No DOM, no clock, no Math.random. Same inputs always give the same result,
 * which enables replay tests and, later, server-authoritative multiplayer.
 */
export const step = (state: SimState, intent: Intent, dt: number): SimState => {
  const c = state.car;
  let { v, nitroCharges, nitroLeft } = c;

  if (intent.nitro && nitroCharges > 0 && nitroLeft <= 0) {
    nitroCharges -= 1;
    nitroLeft = CAR.nitroDuration;
  }
  const boosting = nitroLeft > 0;
  nitroLeft = Math.max(0, nitroLeft - dt);

  const offroad = Math.abs(c.x) > CAR.roadHalfWidth;
  const cap = offroad ? CAR.offroadMaxSpeed : boosting ? CAR.nitroSpeed : CAR.maxSpeed;

  v += (boosting ? CAR.nitroAccel : CAR.accel) * dt;
  v -= CAR.brakeDecel * intent.brake * dt;
  if (v > cap) v = Math.max(cap, v - (offroad ? CAR.offroadDecel : CAR.nitroFadeDecel) * dt);
  v = Math.max(0, v);

  const speedFactor = clamp(v / CAR.maxSpeed, 0.15, 1);
  const x = clamp(
    c.x + intent.steer * CAR.lateralSpeed * speedFactor * dt,
    -CAR.maxLateral,
    CAR.maxLateral,
  );

  return {
    tick: state.tick + 1,
    car: { s: c.s + v * dt, x, v, nitroCharges, nitroLeft },
  };
};
