import { describe, it, expect } from "vitest";
import {
  clampNoShows,
  convertNoShowsPeriod,
  getCategoryOptions,
  getRegionOptions,
  NO_SHOW_LIMITS,
} from "./stepHelpers";
import { CATEGORIES, REGIONS } from "./data";

describe("stepHelpers", () => {
  describe("clampNoShows (AC1)", () => {
    it("should clamp values within the weekly [min, max] range", () => {
      const { min, max } = NO_SHOW_LIMITS.weekly;
      expect(clampNoShows(min - 5, "weekly")).toBe(min);
      expect(clampNoShows(max + 10, "weekly")).toBe(max);
      expect(clampNoShows(15, "weekly")).toBe(15);
    });

    it("should clamp values within the monthly [min, max] range", () => {
      const { min, max } = NO_SHOW_LIMITS.monthly;
      expect(clampNoShows(min - 5, "monthly")).toBe(min);
      expect(clampNoShows(max + 20, "monthly")).toBe(max);
      expect(clampNoShows(50, "monthly")).toBe(50);
    });

    it("should handle NaN by returning the minimum value", () => {
      expect(clampNoShows(NaN, "weekly")).toBe(NO_SHOW_LIMITS.weekly.min);
      expect(clampNoShows(NaN, "monthly")).toBe(NO_SHOW_LIMITS.monthly.min);
    });

    it("should round decimal numbers to the nearest integer", () => {
      expect(clampNoShows(12.4, "weekly")).toBe(12);
      expect(clampNoShows(12.6, "weekly")).toBe(13);
    });
  });

  describe("convertNoShowsPeriod (AC2)", () => {
    it("should convert from weekly to monthly correctly", () => {
      // 5 weekly * 4.33 = 21.65 -> rounded to 22
      expect(convertNoShowsPeriod(5, "weekly", "monthly")).toBe(22);
      // 0 weekly * 4.33 = 0
      expect(convertNoShowsPeriod(0, "weekly", "monthly")).toBe(0);
      // Large weekly value should clamp to monthly max
      expect(convertNoShowsPeriod(50, "weekly", "monthly")).toBe(NO_SHOW_LIMITS.monthly.max);
    });

    it("should convert from monthly to weekly correctly", () => {
      // 22 monthly / 4.33 = 5.08 -> rounded to 5
      expect(convertNoShowsPeriod(22, "monthly", "weekly")).toBe(5);
      // 0 monthly / 4.33 = 0
      expect(convertNoShowsPeriod(0, "monthly", "weekly")).toBe(0);
      // Large monthly value should clamp to weekly max
      expect(convertNoShowsPeriod(200, "monthly", "weekly")).toBe(NO_SHOW_LIMITS.weekly.max);
    });

    it("should return the same value if source and target periods are identical", () => {
      expect(convertNoShowsPeriod(10, "weekly", "weekly")).toBe(10);
      expect(convertNoShowsPeriod(45, "monthly", "monthly")).toBe(45);
    });
  });

  describe("Option lists (AC3)", () => {
    it("should return category list that matches CATEGORIES in data.ts", () => {
      const categories = getCategoryOptions();
      expect(categories).toEqual(CATEGORIES);
      expect(categories.length).toBe(CATEGORIES.length);
    });

    it("should return region list that matches REGIONS in data.ts", () => {
      const regions = getRegionOptions();
      expect(regions).toEqual(REGIONS);
      expect(regions.length).toBe(REGIONS.length);
    });
  });
});
