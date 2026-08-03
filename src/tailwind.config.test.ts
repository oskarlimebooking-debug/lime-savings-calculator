import { expect, test } from "vitest";
import config from "../tailwind.config";

test("tailwind config has correct lime colors", () => {
  const colors = config.theme?.extend?.colors;
  expect(colors).toBeDefined();

  const lime = (colors as Record<string, Record<string, string>> | undefined)?.lime;
  expect(lime).toBeDefined();
  expect(lime?.["500"]).toBe("#22c55e");
  expect(lime?.["600"]).toBe("#16a34a");
});
