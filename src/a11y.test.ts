import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buttonClass, chipClass, contrastRatio, ButtonVariant, ButtonSize } from "./lib/ui";

const AA = 4.5;

/** Povrsinski in besedilni zetoni, kot jih definira tailwind.config.ts. */
const LIGHT = { canvas: "#FAFAFA", card: "#FFFFFF", panel: "#F5F5F7", subtle: "#F0F0F0" };
const DARK = { canvas: "#121413", card: "#1B1E1C", panel: "#232624", subtle: "#2B2E2C" };
const INK = { primary: "#181818", muted: "#5C5C5C" };
const INK_DARK = { primary: "#F2F3F1", muted: "#B1B5B2" };

describe("kontrast (T3.1)", () => {
  test("AC1: CTA hover z belim besedilom in primarno besedilo na canvasu dosezeta AA", () => {
    expect(contrastRatio("#FFFFFF", "#447856")).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio("#181818", "#FAFAFA")).toBeGreaterThanOrEqual(AA);
  });

  test("AC2: vsi pari telesnega besedila dosezejo AA v obeh temah", () => {
    const pairs: Array<[string, string, string]> = [];
    for (const [name, bg] of Object.entries(LIGHT)) {
      for (const [ink, fg] of Object.entries(INK)) pairs.push([`light ${ink} on ${name}`, fg, bg]);
    }
    for (const [name, bg] of Object.entries(DARK)) {
      for (const [ink, fg] of Object.entries(INK_DARK)) pairs.push([`dark ${ink} on ${name}`, fg, bg]);
    }
    expect(pairs.length).toBe(16);
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(AA);
    }
  });

  test("contrastRatio je simetricen, 1 za enaki barvi in 21 za crno/belo", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#548F68", "#548F68")).toBeCloseTo(1, 5);
    expect(contrastRatio("#FFFFFF", "#548F68")).toBeCloseTo(contrastRatio("#548F68", "#FFFFFF"), 10);
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
    expect(() => contrastRatio("zelena", "#FFFFFF")).toThrow();
  });
});

describe("dotikalne tarce in stanja (T3.1)", () => {
  const VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost"];
  const SIZES: ButtonSize[] = ["sm", "md", "lg"];

  test("AC3: buttonClass ima 44px minimalno visino za vse variante in velikosti", () => {
    for (const v of VARIANTS) {
      for (const s of SIZES) {
        expect(buttonClass(v, s), `${v}/${s}`).toContain("min-h-11");
      }
    }
  });

  test("vsak gumb in chip ima hover, focus in active stanje", () => {
    for (const v of VARIANTS) {
      const cls = buttonClass(v);
      expect(cls, `${v} hover`).toMatch(/hover:/);
      expect(cls, `${v} active`).toMatch(/active:/);
      expect(cls, `${v} focus`).toContain("focus-visible:ring-brand-sage");
    }
    for (const selected of [true, false]) {
      const cls = chipClass(selected);
      expect(cls).toMatch(/hover:/);
      expect(cls).toMatch(/active:/);
      expect(cls).toContain("focus-visible:ring-brand-sage");
    }
  });
});

describe("fokus ring v komponentah (T3.1)", () => {
  const dir = join(__dirname, "components");
  const files = readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"));

  test("AC4: nobena komponenta ne uporablja outline-none brez focus-visible:ring", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const src = readFileSync(join(dir, file), "utf8");
      if (!src.includes("outline-none")) continue;
      expect(src, file).toContain("focus-visible:ring");
      // star vzorec `focus:ring` ni vec dovoljen — ring se prikaze le pri tipkovnici
      expect(src, file).not.toMatch(/\bfocus:ring/);
    }
  });

  test("fokus ring je v obeh temah ista sage barva", () => {
    for (const file of files) {
      const src = readFileSync(join(dir, file), "utf8");
      const rings = src.match(/focus-visible:ring-[\w-]+/g) ?? [];
      rings
        .filter((r) => r !== "focus-visible:ring-2")
        .forEach((r) => expect(r, file).toBe("focus-visible:ring-brand-sage"));
    }
  });
});
