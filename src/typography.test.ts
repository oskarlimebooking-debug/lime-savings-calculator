import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import config from "../tailwind.config";

const read = (...p: string[]) => readFileSync(join(__dirname, ...p), "utf8");

describe("Inter tipografska lestvica (T1.2)", () => {
  const fontSize = config.theme?.extend?.fontSize as
    | Record<string, [string, Record<string, string>]>
    | undefined;

  /** Lime univerzalna lestvica — ista na vseh prelomnih tockah. */
  const SCALE: Record<string, [string, Record<string, string>]> = {
    h1: ["24px", { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.25px" }],
    h2: ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.25px" }],
    h3: ["18px", { lineHeight: "26px", fontWeight: "600" }],
    h4: ["16px", { lineHeight: "22px", fontWeight: "600" }],
    "body-l": ["16px", { lineHeight: "24px", fontWeight: "400" }],
    "body-m": ["14px", { lineHeight: "21px", fontWeight: "400" }],
    subtitle: ["13px", { lineHeight: "18px", fontWeight: "500" }],
    caption: ["12px", { lineHeight: "17px", fontWeight: "400" }],
    button: ["14px", { lineHeight: "17px", fontWeight: "500" }],
    label: ["11px", { lineHeight: "15px", fontWeight: "500", letterSpacing: "0.4px" }],
  };

  test("AC1: fontSize vsebuje vse zetone lestvice z ujemajocimi se pari", () => {
    expect(Object.keys(fontSize ?? {}).sort()).toEqual(Object.keys(SCALE).sort());
    for (const [key, expected] of Object.entries(SCALE)) {
      expect(fontSize?.[key], key).toEqual(expected);
    }
  });

  test("AC2: layout.tsx nalaga Inter in ne vec Geista", () => {
    const layout = read("app", "layout.tsx");
    expect(layout).toContain("Inter");
    expect(layout).not.toContain("Geist");
  });

  test("AC3: globals.css ne uporablja vec Ariala", () => {
    const css = read("app", "globals.css");
    expect(css).not.toContain("Arial");
    expect(css).toMatch(/font-family:\s*var\(--font-inter\)/);
  });

  test("AC4: Geist woff datoteke so odstranjene", () => {
    expect(existsSync(join(__dirname, "app", "fonts", "GeistVF.woff"))).toBe(false);
    expect(existsSync(join(__dirname, "app", "fonts", "GeistMonoVF.woff"))).toBe(false);
  });
});
