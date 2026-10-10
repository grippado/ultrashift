import { describe, expect, it } from "vitest";
import { NEUTRAL_INTENT } from "../src/input/types";
import { CAR, SIM_DT } from "../src/shared/tuning";
import { createState } from "../src/sim/state";
import { step } from "../src/sim/step";

const run = (n: number, intent = NEUTRAL_INTENT) => {
  let s = createState();
  for (let i = 0; i < n; i++) s = step(s, intent, SIM_DT);
  return s;
};

describe("step", () => {
  it("accelerates automatically up to max speed", () => {
    const s = run(60 * 10);
    expect(s.car.v).toBeCloseTo(CAR.maxSpeed);
    expect(s.car.s).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    const intent = { steer: 0.3, brake: 0, nitro: false };
    expect(run(500, intent)).toEqual(run(500, intent));
  });

  it("steers and slows when offroad", () => {
    const s = run(60 * 10, { steer: 1, brake: 0, nitro: false });
    expect(s.car.x).toBeGreaterThan(CAR.roadHalfWidth);
    expect(s.car.v).toBeLessThanOrEqual(CAR.offroadMaxSpeed + 1);
  });

  it("brake slows the car", () => {
    const fast = run(60 * 10);
    const braked = step(fast, { steer: 0, brake: 0.6, nitro: false }, SIM_DT);
    expect(braked.car.v).toBeLessThan(fast.car.v);
  });

  it("nitro consumes a charge, boosts, and ends", () => {
    let s = run(60 * 10);
    s = step(s, { steer: 0, brake: 0, nitro: true }, SIM_DT);
    expect(s.car.nitroCharges).toBe(CAR.nitroCharges - 1);
    for (let i = 0; i < 60 * 2; i++) s = step(s, NEUTRAL_INTENT, SIM_DT);
    expect(s.car.v).toBeGreaterThan(CAR.maxSpeed);
    for (let i = 0; i < 60 * 3; i++) s = step(s, NEUTRAL_INTENT, SIM_DT);
    expect(s.car.nitroLeft).toBe(0);
  });

  it("ignores nitro when no charges are left", () => {
    let s = run(10);
    s = { ...s, car: { ...s.car, nitroCharges: 0 } };
    s = step(s, { steer: 0, brake: 0, nitro: true }, SIM_DT);
    expect(s.car.nitroLeft).toBe(0);
  });
});
