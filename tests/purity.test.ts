import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** sim/shared/net must stay pure so the same code can run on a multiplayer server. */
const FORBIDDEN = [
  /\bMath\.random\b/,
  /\bDate\.now\b/,
  /\bperformance\b/,
  /\bdocument\b/,
  /\bwindow\b/,
  /\blocalStorage\b/,
];
const DIRS = ["src/sim", "src/shared", "src/net", "src/track"];

describe("pure modules", () => {
  for (const dir of DIRS) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
      it(`${dir}/${f} has no impure APIs`, () => {
        const code = readFileSync(join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
        for (const re of FORBIDDEN) expect(code).not.toMatch(re);
      });
    }
  }
});
