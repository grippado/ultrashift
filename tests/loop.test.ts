import { describe, expect, it } from "vitest";
import { FixedStepLoop } from "../src/game/loop";

describe("FixedStepLoop", () => {
  it("runs a stable number of steps and clamps long frames", () => {
    let n = 0;
    const loop = new FixedStepLoop(() => n++, 1 / 60);
    for (let i = 0; i < 60; i++) loop.advance(1000 / 60 + 0.001);
    expect(n).toBe(60);
    n = 0;
    loop.advance(5000);
    expect(n).toBeLessThanOrEqual(5);
  });

  it("returns alpha in [0,1)", () => {
    const loop = new FixedStepLoop(() => {}, 1 / 60);
    const a = loop.advance(10);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
  });
});
