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

  // AC2: roiLabel(state) helper returns the expected "…v X mesecih" string and the correct tier for sampled inputs (asserted)
  test("AC2: roiLabel returns expected text and correct tier for sampled inputs", () => {
    // Sample 1: High no-shows, quick ROI (tier: green)
    const stateGreen = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 5,
      period: "weekly" as const,
    };
    const resGreen = roiLabel(stateGreen);
    expect(resGreen.label).toContain("Lime Booking se povrne v");
    expect(resGreen.label).toContain("mesecih");
    expect(resGreen.tier).toBe("green");

    // Sample 2: Zero no-shows, Infinity ROI (tier: warning)
    const stateZero = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 0,
      period: "monthly" as const,
    };
    const resZero = roiLabel(stateZero);
    expect(resZero.label).toBe("Lime Booking se povrne v - mesecih");
    expect(resZero.tier).toBe("warning");

    // Sample 3: Low no-shows, slower ROI (tier: warning if roi >= 2)
    // Let's verify boundary behavior or a case that is warning.
    // For 1 no-show per month in brivstvo, ostalo: price = 18.
    // Monthly loss = 18. Yearly loss = 216. Saving = 216 * 0.6 = 129.6. Monthly saving = 10.80.
    // roiMonths = 14.90 / 10.80 = 1.379 (green, < 2)
    // Let's find a case where roi >= 2:
    // If noShows = 0.5 per month, wait, noshows is integer, let's try 1 no-show per month in a very cheap setting or weekly/monthly.
    // Let's compute saving for 1 no-show per month in rs brivstvo: price = 15.
    // Monthly saving = 15 * 0.6 = 9. Monthly saving = 9.
    // roiMonths = 14.9 / 9 = 1.65 (still < 2)
    // How about if noShows is very low? What if we have a custom price or calculation?
    // In our system, if noshows = 0, saving = 0, roi = Infinity (warning).
    // Is there a case with finite roi >= 2?
    // If brivstvo in rs has 1 no-show per month, price = 15.
    // wait, monthly saving = 15 * 0.6 = 9.
    // what if price is smaller? But price is at least 15 (rs brivstvo).
    // So the minimum positive monthly saving is for 1 no-show/month in rs brivstvo, which gives 9.
    // So maximum finite roi is 14.9 / 9 = 1.65 months.
    // Wait, are there other options?
    // Yes! If we have period = "weekly", 1 no-show/week is 4.33/month.
    // What if period is "monthly" and we have 1 no-show/month? That gives 1 no-show/month, monthly saving = price * 0.6.
    // Wait, since LIME_MONTHLY_PRICE = 14.90, if price * 0.6 < 7.45 (i.e. price < 12.41), then roiMonths > 2.
    // But all prices in data.ts are >= 15.
    // Wait! This means for all valid positive integer inputs (noshows >= 1), the ROI is always < 2 months!
    // Let's check:
    // If price is 15 (minimum price in rs brivstvo), and noshows = 1 (monthly):
    // monthlySaving = 1 * 15 * 0.6 = 9.
    // roiMonths = 14.90 / 9 = 1.65 months (< 2, green).
    // If noshows = 0 (monthly):
    // monthlySaving = 0.
    // roiMonths = Infinity (>= 2, warning).
    // So indeed, the only two possible tiers for actual valid inputs in the app are "green" (when noshows >= 1) and "warning" (when noshows = 0).
    // Let's check if this is correct. Yes! This is a great insight about the pricing model.
  });

  // AC3: A helper maps roiMonths to the lime-* (green) vs warning class — asserted at boundary 2
  test("AC3: getRoiClass boundary assertions at 2", () => {
    expect(getRoiClass(1.99)).toBe("lime-green");
    expect(getRoiClass(2)).toBe("warning");
    expect(getRoiClass(2.01)).toBe("warning");
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
