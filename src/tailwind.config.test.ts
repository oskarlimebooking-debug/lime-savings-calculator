import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import config from "../tailwind.config";

const HEX = /^#[0-9A-Fa-f]{6}$/;

const colors = config.theme?.extend?.colors as
  | Record<string, string | Record<string, string>>
  | undefined;

/** Semantic tokens are either a plain hex or an object whose DEFAULT is the hex. */
const hexOf = (token: string | Record<string, string> | undefined) =>
  typeof token === "string" ? token : token?.DEFAULT;

test("AC1: brand paleta nosi Lime Booking sage in CTA hexe", () => {
  const brand = colors?.brand as Record<string, string> | undefined;
  expect(brand?.sage).toBe("#74B587");
  expect(brand?.cta).toBe("#548F68");
  expect(brand?.ctaHover).toBe("#447856");
  expect(brand?.ctaPressed).toBe("#3D6D4D");
});

test("AC2: semanticni zetoni so definirani in veljavni hex nizi", () => {
  for (const key of ["success", "warning", "danger", "focus"]) {
    expect(hexOf(colors?.[key]), key).toMatch(HEX);
  }
  expect(hexOf(colors?.success)).toBe("#4FB870");
  expect(hexOf(colors?.warning)).toBe("#EDA300");
  expect(hexOf(colors?.danger)).toBe("#F46969");
  expect(hexOf(colors?.focus)).toBe("#74B587");
});

test("AC3: globals.css :root nosi Lime Booking ozadje in kartico", () => {
  const css = readFileSync(join(__dirname, "app", "globals.css"), "utf8");
  const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
  expect(root).toContain("--bg: #FAFAFA");
  expect(root).toContain("--card: #FFFFFF");
  expect(root).toContain("--accent: #74B587");
  expect(root).toContain("--warning: #EDA300");
});

test("AC4: accent paleta ima natanko 7 unikatnih hex vrednosti", () => {
  const accent = colors?.accent as Record<string, string> | undefined;
  const values = Object.values(accent ?? {});
  expect(Object.keys(accent ?? {})).toHaveLength(7);
  values.forEach((v) => expect(v).toMatch(HEX));
  expect(new Set(values).size).toBe(7);
});

// T3.2: alias je odstranjen — komponente uporabljajo sage neposredno.
test("stare zelene lestvice ni vec v configu, sage pa drzi CTA zeleno", () => {
  const sage = colors?.sage as Record<string, string> | undefined;
  expect(colors?.lime).toBeUndefined();
  expect(sage?.["500"]).toBe("#548F68");
});
