import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import config from "../tailwind.config";

const css = readFileSync(join(__dirname, "app", "globals.css"), "utf8");

/** Izsek bloka `@media (prefers-color-scheme: dark)` iz globals.css. */
const darkBlock = (() => {
  const start = css.indexOf("@media (prefers-color-scheme: dark)");
  expect(start).toBeGreaterThan(-1);
  const end = css.indexOf("\n}", css.indexOf("{", start));
  return css.slice(start, end);
})();

describe("povrsine, radiji in temna tema (T1.3)", () => {
  test("AC1: borderRadius nosi kartico, kontrolo in pill", () => {
    const radius = config.theme?.extend?.borderRadius as
      | Record<string, string>
      | undefined;
    expect(radius?.card).toBe("12px");
    expect(radius?.control).toBe("8px");
    expect(radius?.pill).toBe("9999px");
  });

  test("AC2: surface nosi stiri svetle in stiri temne stopnje, vse unikatne", () => {
    const surface = (
      config.theme?.extend?.colors as Record<string, Record<string, string>> | undefined
    )?.surface;
    const light = ["canvas", "card", "panel", "subtle"];
    const dark = light.map((k) => `dark-${k}`);

    expect(Object.keys(surface ?? {}).sort()).toEqual([...light, ...dark].sort());
    expect(light.map((k) => surface?.[k])).toEqual([
      "#FAFAFA",
      "#FFFFFF",
      "#F5F5F7",
      "#F0F0F0",
    ]);
    expect(dark.map((k) => surface?.[k])).toEqual([
      "#121413",
      "#1B1E1C",
      "#232624",
      "#2B2E2C",
    ]);

    const values = Object.values(surface ?? {});
    expect(new Set(values).size).toBe(values.length);
  });

  test("AC3: temni blok definira canvas in kartico", () => {
    expect(darkBlock).toContain("--bg: #121413");
    expect(darkBlock).toContain("--card: #1B1E1C");
    expect(darkBlock).toContain("--panel: #232624");
    expect(darkBlock).toContain("--subtle: #2B2E2C");
    expect(darkBlock).toContain("--line: #2E322F");
  });

  test("AC4: temni blok ne definira nobene sence (elevacija samo s svetlostjo)", () => {
    expect(darkBlock).not.toMatch(/box-shadow/);
    // --shadow-modal sme obstajati le kot `none`
    const shadowDecls = darkBlock.match(/--shadow[^;]*;/g) ?? [];
    shadowDecls.forEach((d) => expect(d).toMatch(/:\s*none;/));
  });

  test("svetli blok ohrani edino dovoljeno senco za modale/popover", () => {
    const root = css.slice(css.indexOf(":root"), css.indexOf("\n}", css.indexOf(":root")));
    expect(root).toMatch(/--shadow-modal:\s*0 /);
    expect(config.theme?.extend?.boxShadow).toHaveProperty("modal");
  });
});
