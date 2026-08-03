import { expect, test, describe } from "vitest";
import {
  normalizeNoShows,
  calculateMonthlyLoss,
  calculateYearlyLoss,
  calculateYearlySaving,
  calculateMonthlySaving,
  calculateRoiMonths,
  roiTier,
  calculateSavings,
} from "./calc";
import { LIME_MONTHLY_PRICE, NOSHOW_REDUCTION } from "./data";

describe("Pure calculation engine tests", () => {
  // AC1: Weekly input of 5 with price 30 yields monthlyLoss ≈ 649.5 and yearlyLoss ≈ 7794 (vitest, tolerance ±0.5)
  test("AC1: weekly inputs yield expected monthly and yearly losses within tolerance", () => {
    const result = calculateSavings(5, "weekly", 30);
    expect(result.monthlyLoss).toBeCloseTo(649.5, 1); // 0.1 decimal tolerance is well within ±0.5
    expect(result.yearlyLoss).toBeCloseTo(7794, 1);
    
    // Also test explicitly with tolerance check of ±0.5
    expect(Math.abs(result.monthlyLoss - 649.5)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(result.yearlyLoss - 7794)).toBeLessThanOrEqual(0.5);
  });

  // AC2: yearlySaving === yearlyLoss * 0.6 for sampled inputs (asserted)
  test("AC2: yearlySaving is exactly 60% of yearlyLoss for sampled inputs", () => {
    const samples = [0, 100, 500, 1000, 2500, 10000];
    for (const loss of samples) {
      const saving = calculateYearlySaving(loss);
      expect(saving).toBe(loss * 0.6);
      expect(saving).toBe(loss * NOSHOW_REDUCTION);
    }
  });

  // AC3: roiMonths equals LIME_MONTHLY_PRICE / monthlySaving and returns Infinity (not NaN/throw) when no-shows = 0
  test("AC3: roiMonths handles zero inputs and division safely", () => {
    // Standard division check
    const savingSample = 50;
    expect(calculateRoiMonths(savingSample)).toBe(LIME_MONTHLY_PRICE / savingSample);

    // No-shows = 0 check
    const resultForZero = calculateSavings(0, "monthly", 30);
    expect(resultForZero.roiMonths).toBe(Infinity);
    expect(Number.isNaN(resultForZero.roiMonths)).toBe(false);

    // Verify it doesn't throw and handles negative/zero values
    expect(() => calculateRoiMonths(0)).not.toThrow();
    expect(calculateRoiMonths(0)).toBe(Infinity);
    expect(calculateRoiMonths(-5)).toBe(Infinity);
  });

  // AC4: roiTier returns 'green' for roiMonths < 2 and 'warning' for ≥ 2 (boundary tested at 2)
  test("AC4: roiTier boundary and partitioning behavior", () => {
    expect(roiTier(1.99)).toBe("green");
    expect(roiTier(2)).toBe("warning");
    expect(roiTier(2.01)).toBe("warning");
    expect(roiTier(0)).toBe("green");
    expect(roiTier(Infinity)).toBe("warning");
  });

  // AC5: All calc functions are pure — same inputs give same outputs across repeated calls (asserted)
  test("AC5: purity checks for all calculation functions", () => {
    const testPurity = <Args extends unknown[], Ret>(
      fn: (...args: Args) => Ret,
      args: Args
    ) => {
      const firstResult = fn(...args);
      for (let i = 0; i < 5; i++) {
        expect(fn(...args)).toEqual(firstResult);
      }
    };

    testPurity(normalizeNoShows, [5, "weekly"]);
    testPurity(normalizeNoShows, [12, "monthly"]);
    testPurity(calculateMonthlyLoss, [21.65, 30]);
    testPurity(calculateYearlyLoss, [649.5]);
    testPurity(calculateYearlySaving, [7794]);
    testPurity(calculateMonthlySaving, [4676.4]);
    testPurity(calculateRoiMonths, [389.7]);
    testPurity(roiTier, [1.5]);
    testPurity(roiTier, [2.5]);
    testPurity(calculateSavings, [5, "weekly", 30]);
  });
});
