import { expect, test, describe } from "vitest";
import {
  CATEGORIES,
  REGIONS,
  PRICES,
  getPrice,
  NOSHOW_REDUCTION,
  LIME_MONTHLY_PRICE,
  PACKAGES,
  getPackage,
  DEFAULT_PACKAGE_SLUG,
  LIME_BOOKING_URL,
} from "./data";

describe("Price/region/category data module tests", () => {
  // AC1: getPrice(category, region) returns a positive finite number for every valid category x region combination
  test("getPrice returns a positive finite number for every valid combination (AC1)", () => {
    for (const cat of CATEGORIES) {
      for (const reg of REGIONS) {
        const price = getPrice(cat.slug, reg.slug);
        expect(price).toBeGreaterThan(0);
        expect(Number.isFinite(price)).toBe(true);
      }
    }
  });

  // AC2: getPrice throws for unknown keys
  test("getPrice throws for unknown keys (AC2)", () => {
    expect(() => getPrice("invalid-category", "osrednjeslovenska")).toThrow();
    expect(() => getPrice("frizerstvo", "invalid-region")).toThrow();
  });

  // AC3: CATEGORIES and REGIONS arrays each have unique slug keys
  test("CATEGORIES and REGIONS have unique slug keys (AC3)", () => {
    const categorySlugs = CATEGORIES.map((c) => c.slug);
    const regionSlugs = REGIONS.map((r) => r.slug);

    expect(new Set(categorySlugs).size).toBe(categorySlugs.length);
    expect(new Set(regionSlugs).size).toBe(regionSlugs.length);
  });

  // AC4: NOSHOW_REDUCTION is within [0.5, 0.7] and LIME_MONTHLY_PRICE > 0
  test("constants are valid (AC4)", () => {
    expect(NOSHOW_REDUCTION).toBeGreaterThanOrEqual(0.5);
    expect(NOSHOW_REDUCTION).toBeLessThanOrEqual(0.7);
    expect(LIME_MONTHLY_PRICE).toBeGreaterThan(0);
  });

  // AC5: Every category exposes a price entry for every region (no undefined gaps)
  test("every category has a price entry for every region (AC5)", () => {
    for (const cat of CATEGORIES) {
      const catPrices = PRICES[cat.slug as keyof typeof PRICES];
      expect(catPrices).toBeDefined();
      for (const reg of REGIONS) {
        const price = catPrices[reg.slug as keyof typeof catPrices];
        expect(price).toBeDefined();
        expect(typeof price).toBe("number");
      }
    }
  });

  // AC6: LIME_BOOKING_URL points at the live domain (lime-booking.com), not the non-resolving limebooking.si
  test("LIME_BOOKING_URL points at the live lime-booking.com domain (AC6)", () => {
    expect(LIME_BOOKING_URL).toBe("https://lime-booking.com");
  });

  // AC7: PACKAGES has exactly Basic (email-only) and Advanced (SMS) tiers, Advanced has the higher
  // reduction rate and higher price, and the default package is Advanced.
  test("PACKAGES models Basic vs Advanced correctly and defaults to Advanced (AC7)", () => {
    expect(PACKAGES.length).toBe(2);

    const basic = PACKAGES.find((p) => p.slug === "basic");
    const advanced = PACKAGES.find((p) => p.slug === "advanced");
    expect(basic).toBeDefined();
    expect(advanced).toBeDefined();

    expect(basic!.notificationChannel).toBe("email");
    expect(basic!.smsCount).toBeNull();
    expect(advanced!.notificationChannel).toBe("sms");
    expect(advanced!.smsCount).toBeGreaterThan(0);

    // Advanced (SMS) outperforms Basic (email-only) on both no-show reduction and price
    expect(advanced!.noShowReduction).toBeGreaterThan(basic!.noShowReduction);
    expect(advanced!.monthlyPrice).toBeGreaterThan(basic!.monthlyPrice);

    expect(DEFAULT_PACKAGE_SLUG).toBe("advanced");

    // getPackage resolves valid slugs and falls back to the default for unknown ones
    expect(getPackage("basic")).toEqual(basic);
    expect(getPackage("advanced")).toEqual(advanced);
    expect(getPackage("nonexistent")).toEqual(advanced);

    // Backward-compatible aliases mirror the default (Advanced) package
    expect(NOSHOW_REDUCTION).toBe(advanced!.noShowReduction);
    expect(LIME_MONTHLY_PRICE).toBe(advanced!.monthlyPrice);
  });
});
