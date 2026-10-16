import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SETTLE_MS } from "./components/RewardsSection";

const css = readFileSync(join(__dirname, "app", "globals.css"), "utf8");

/** Prva skupina vsakega ujemanja — exec zanka, ker tsconfig cilja na ES5. */
function captures(source: string, pattern: RegExp): string[] {
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.push(m[1]);
  return out;
}

describe("umirjena animacija po Lime pravilih (T2.3)", () => {
  test("AC1: nobena animacija ne uporablja krivulje z kontrolno tocko > 1", () => {
    const curves = css.match(/cubic-bezier\([^)]*\)/g) ?? [];
    for (const curve of curves) {
      const points = curve
        .replace(/cubic-bezier\(|\)/g, "")
        .split(",")
        .map((n) => parseFloat(n));
      // y lahko presega [0,1] samo pri odboju; Lime dovoljuje le ease-out
      points.forEach((p) => expect(p, curve).toBeLessThanOrEqual(1));
    }
  });

  test("AC2: prefers-reduced-motion blok nasteje vse aktivne animacijske razrede", () => {
    const reduceStart = css.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(reduceStart).toBeGreaterThan(-1);
    const beforeReduce = css.slice(0, reduceStart);
    const reduceBlock = css.slice(reduceStart);

    // Izpeljan seznam: vsak razred, ki ima pravilo `animation: <ime> ...`.
    const animated = captures(beforeReduce, /\.([A-Za-z][\w-]*)\s*\{[^}]*\banimation:/g);

    expect(animated.length).toBeGreaterThan(0);
    for (const cls of animated) {
      expect(reduceBlock, cls).toContain(`.${cls}`);
    }
    expect(reduceBlock).toMatch(/animation:\s*none\s*!important/);
  });

  test("AC3: SETTLE_MS je narascajoce zaporedje, zadnji element <= 3000", () => {
    const ms = [...SETTLE_MS];
    expect(ms.length).toBeGreaterThan(0);
    ms.forEach((v) => expect(Number.isFinite(v) && v > 0).toBe(true));
    for (let i = 1; i < ms.length; i++) {
      expect(ms[i], `${ms[i - 1]} -> ${ms[i]}`).toBeGreaterThan(ms[i - 1]);
    }
    expect(ms[ms.length - 1]).toBeLessThanOrEqual(3000);
  });

  test("trajanja animacij ostanejo kratka (<= 0.6s), reelSpin pa linearen", () => {
    const durations = captures(css, /animation:\s*\w+\s+([\d.]+)s/g).map(parseFloat);
    expect(durations.length).toBeGreaterThan(0);
    durations.forEach((d) => expect(d).toBeLessThanOrEqual(0.6));
    expect(css).toMatch(/animation:\s*reelSpin\s+[\d.]+s\s+linear\s+infinite/);
  });

  test("nobeni mrtvi keyframi: vsak @keyframes ima pravilo, ki ga uporablja", () => {
    const names = captures(css, /@keyframes\s+([\w-]+)/g);
    const used = captures(css, /animation:\s*([\w-]+)/g);
    names.forEach((n) => expect(used, n).toContain(n));
  });
});
