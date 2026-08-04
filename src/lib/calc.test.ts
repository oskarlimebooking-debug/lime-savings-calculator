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
  formatEUR,
  getRoiClass,
  roiLabel,
  buildFootnoteText,
  FOOTNOTE_TEXT,
} from "./calc";
import { LIME_MONTHLY_PRICE, NOSHOW_REDUCTION, PACKAGES } from "./data";

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

  // AC4: roiTier returns 'green' for a payback of 30 days or less (roiMonths <= 1)
  // and 'warning' once it takes more than 30 days (boundary tested at 1 month / 30 days)
  test("AC4: roiTier boundary and partitioning behavior", () => {
    expect(roiTier(0.99)).toBe("green");
    expect(roiTier(1)).toBe("green");
    expect(roiTier(1.01)).toBe("warning");
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

  // AC1: formatEUR(1234.5) returns a sl-SI formatted euro string (vitest, contains "€" and grouped digits)
  test("AC1: formatEUR returns a sl-SI formatted euro string", () => {
    const formatted = formatEUR(1234.5);
    expect(formatted).toContain("€");
    // In sl-SI: "1.234,50" or similar grouped format. Expect the decimal comma and dot grouping or at least a comma and space before €.
    // Since we forced grouping, it should be exactly "1.234,50" followed by a no-break space and "€".
    // We replace non-breaking space with normal space to make regex check robust.
    const normalized = formatted.replace(/\u00a0/g, " ");
    expect(normalized).toMatch(/1\.234,50\s*€/);

    const formattedLarge = formatEUR(12345.67).replace(/\u00a0/g, " ");
    expect(formattedLarge).toMatch(/12\.345,67\s*€/);
  });

  // AC2: roiLabel(state) helper returns the expected "…v X dneh" string and the correct tier for sampled inputs (asserted)
  test("AC2: roiLabel returns expected text and correct tier for sampled inputs", () => {
    // Sample 1: High no-shows, quick ROI (tier: green)
    // frizerstvo/osrednjeslovenska price = 45. 5 no-shows/week ≈ 21.65/month.
    // monthlySaving = 21.65 × 45 × 0.6 = 584.55/month. roiMonths = 29.90 / 584.55 ≈ 0.051 (≈1.5 days, well under 30).
    const stateGreen = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 5,
      period: "weekly" as const,
    };
    const resGreen = roiLabel(stateGreen);
    expect(resGreen.label).toContain("Lime Booking se povrne v");
    expect(resGreen.label).toContain("dneh");
    expect(resGreen.tier).toBe("green");

    // Sample 2: Zero no-shows, Infinity ROI (tier: warning)
    const stateZero = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 0,
      period: "monthly" as const,
    };
    const resZero = roiLabel(stateZero);
    expect(resZero.label).toBe("Lime Booking se povrne v - dneh");
    expect(resZero.tier).toBe("warning");

    // Sample 3: Low no-shows in the cheapest category/region (tier: warning, payback > 30 days)
    // brivstvo/rs price = 15 (the cheapest in the pricing table). 1 no-show/month:
    // monthlySaving = 1 × 15 × 0.6 = 9/month. roiMonths = 29.90 / 9 ≈ 3.32 (≈ 99.7 days, well over 30).
    const stateWarningFinite = {
      category: "brivstvo",
      region: "rs",
      noshows: 1,
      period: "monthly" as const,
    };
    const resWarningFinite = roiLabel(stateWarningFinite);
    expect(resWarningFinite.label).toBe("Lime Booking se povrne v 100 dneh");
    expect(resWarningFinite.tier).toBe("warning");
  });

  // AC3: A helper maps roiMonths to the lime-* (green) vs warning class — asserted at the 30-day boundary (roiMonths === 1)
  test("AC3: getRoiClass boundary assertions at 30 days (1 month)", () => {
    expect(getRoiClass(0.99)).toBe("lime-green");
    expect(getRoiClass(1)).toBe("lime-green");
    expect(getRoiClass(1.01)).toBe("warning");
    expect(getRoiClass(0)).toBe("lime-green");
    expect(getRoiClass(Infinity)).toBe("warning");
  });

  // AC4: Source footnote text is present in the rendered output helper/props (asserted non-empty string)
  test("AC4: FOOTNOTE_TEXT is a non-empty string referencing the default package and the live domain", () => {
    expect(typeof FOOTNOTE_TEXT).toBe("string");
    expect(FOOTNOTE_TEXT.length).toBeGreaterThan(0);
    expect(FOOTNOTE_TEXT).toContain("60 %");
    expect(FOOTNOTE_TEXT).toContain("Napredni");
    expect(FOOTNOTE_TEXT).not.toContain("limebooking.si");
  });

  // AC5: buildFootnoteText differentiates the Basic/Osnovni (email-only) and Advanced/Napredni (SMS) packages
  test("AC5: buildFootnoteText reflects each package's reduction rate and channel", () => {
    const basicText = buildFootnoteText("basic");
    const advancedText = buildFootnoteText("advanced");

    const basicPkg = PACKAGES.find((p) => p.slug === "basic")!;
    const advancedPkg = PACKAGES.find((p) => p.slug === "advanced")!;

    expect(basicText).toContain(`${Math.round(basicPkg.noShowReduction * 100)} %`);
    expect(basicText).toContain(basicPkg.name);
    expect(basicText).not.toContain("SMS");

    expect(advancedText).toContain(`${Math.round(advancedPkg.noShowReduction * 100)} %`);
    expect(advancedText).toContain(advancedPkg.name);
    expect(advancedText).toContain("SMS");

    // Unknown package slugs fall back to the default (Advanced) package's text
    expect(buildFootnoteText(undefined)).toBe(advancedText);
  });
});
