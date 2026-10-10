import { describe, expect, it } from "vitest";
import { GestureRecognizer } from "../src/input/gestures";
import { GESTURE } from "../src/shared/tuning";

const mm = GESTURE.pxPerMm;
const p = (id: number, x: number, y: number, t: number) => ({ id, x, y, t });

describe("GestureRecognizer", () => {
  it("steers right after dragging right, resets on release", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 500, 0));
    g.move(p(1, 100 + 12 * mm, 500, 50));
    let i = g.sample(60, 16);
    for (let n = 0; n < 30; n++) i = g.sample(60 + n * 16, 16);
    expect(g.state).toBe("STEERING");
    expect(i.steer).toBeGreaterThan(0.9);
    g.up(p(1, 100 + 12 * mm, 500, 600));
    for (let n = 0; n < 30; n++) i = g.sample(700 + n * 16, 16);
    expect(i.steer).toBe(0);
  });

  it("does not brake straight from PRESSED, only after STEERING is committed", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 100, 0));
    g.move(p(1, 100, 100 + 20 * mm, 10));
    // moved past dead zone, so it commits to STEERING and then evaluates brake
    expect(g.state).toBe("BRAKING");
    const g2 = new GestureRecognizer();
    g2.down(p(1, 100, 100, 0));
    g2.move(p(1, 100, 100 + 1 * mm, 10));
    expect(g2.state).toBe("PRESSED");
    expect(g2.sample(20, 16).brake).toBe(0);
  });

  it("brakes lightly when dragging down, capped by brakeMax, exits with hysteresis", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 100, 0));
    g.move(p(1, 100, 100 + 4 * mm, 10));
    expect(g.state).toBe("STEERING");
    g.move(p(1, 100, 100 + 40 * mm, 20));
    expect(g.state).toBe("BRAKING");
    expect(g.sample(30, 16).brake).toBeCloseTo(GESTURE.brakeMax);
    g.move(p(1, 100, 100 + 2 * mm, 40));
    expect(g.state).toBe("STEERING");
  });

  it("ignores upward drags for braking", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 500, 0));
    g.move(p(1, 100, 500 - 30 * mm, 10));
    expect(g.state).toBe("STEERING");
    expect(g.sample(20, 16).brake).toBe(0);
  });

  it("fires nitro on the second pointerdown of a double tap", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 200, 400, 0));
    g.up(p(1, 200, 400, 80));
    expect(g.sample(90, 16).nitro).toBe(false);
    g.down(p(2, 205, 402, 200));
    expect(g.sample(210, 16).nitro).toBe(true);
    expect(g.sample(226, 16).nitro).toBe(false);
  });

  it("does not fire nitro for a slow second tap or a drag followed by a tap", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 200, 400, 0));
    g.up(p(1, 200, 400, 80));
    g.down(p(2, 200, 400, 600));
    expect(g.sample(610, 16).nitro).toBe(false);

    const h = new GestureRecognizer();
    h.down(p(1, 200, 400, 0));
    h.move(p(1, 200 + 20 * mm, 400, 40));
    h.up(p(1, 200 + 20 * mm, 400, 100));
    h.down(p(2, 200, 400, 200));
    expect(h.sample(210, 16).nitro).toBe(false);
  });

  it("second finger tap while owner holds triggers nitro", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 400, 0));
    g.down(p(2, 300, 600, 500));
    expect(g.sample(510, 16).nitro).toBe(true);
  });

  it("cancel clears everything", () => {
    const g = new GestureRecognizer();
    g.down(p(1, 100, 400, 0));
    g.up(p(1, 100, 400, 50));
    g.cancel();
    g.down(p(2, 100, 400, 100));
    expect(g.sample(110, 16).nitro).toBe(false);
  });
});
