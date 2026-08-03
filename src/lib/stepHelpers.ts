import { CATEGORIES, REGIONS, Category, Region } from "./data";
import { Period } from "./calc";

export const NO_SHOW_LIMITS = {
  weekly: { min: 0, max: 30 },
  monthly: { min: 0, max: 120 },
} as const;

/**
 * Clamps out-of-range slider/numeric values to [min, max] based on period.
 */
export function clampNoShows(value: number, period: Period): number {
  const { min, max } = NO_SHOW_LIMITS[period];
  if (isNaN(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}

/**
 * Converts the displayed count correctly between modes (weekly/monthly) and clamps it to target range.
 */
export function convertNoShowsPeriod(value: number, from: Period, to: Period): number {
  if (from === to) return value;
  if (to === "monthly") {
    // Convert weekly to monthly: value * 4.33
    const converted = value * 4.33;
    return clampNoShows(converted, "monthly");
  } else {
    // Convert monthly to weekly: value / 4.33
    const converted = value / 4.33;
    return clampNoShows(converted, "weekly");
  }
}

/**
 * Derives category list from lib/data.ts
 */
export function getCategoryOptions(): readonly Category[] {
  return CATEGORIES;
}

/**
 * Derives region list from lib/data.ts
 */
export function getRegionOptions(): readonly Region[] {
  return REGIONS;
}
