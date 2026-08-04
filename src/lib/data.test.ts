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
  ADDONS,
  calculateAddonsTotal,
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

  // AC7: PACKAGES has all 4 real lime-booking.si/cenik tiers (basic/advanced/growth/pro),
  // strictly increasing in price, SMS-inclusive tiers share the higher reduction rate, and the
  // default package is Advanced.
  test("PACKAGES models all 4 tiers correctly and defaults to Advanced (AC7)", () => {
    expect(PACKAGES.length).toBe(4);
    expect(PACKAGES.map((p) => p.slug)).toEqual(["basic", "advanced", "growth", "pro"]);

    const basic = PACKAGES.find((p) => p.slug === "basic")!;
    const advanced = PACKAGES.find((p) => p.slug === "advanced")!;
    const growth = PACKAGES.find((p) => p.slug === "growth")!;
    const pro = PACKAGES.find((p) => p.slug === "pro")!;

    expect(basic.notificationChannel).toBe("email");
    expect(basic.smsCount).toBeNull();
    for (const pkg of [advanced, growth, pro]) {
      expect(pkg.notificationChannel).toBe("sms");
      expect(pkg.smsCount).toBeGreaterThan(0);
      // SMS-inclusive tiers all share Advanced's reduction rate (no unsupported inflation for extra features)
      expect(pkg.noShowReduction).toBe(advanced.noShowReduction);
    }

    // Strictly increasing monthly price across tiers
    expect(basic.monthlyPrice).toBeLessThan(advanced.monthlyPrice);
    expect(advanced.monthlyPrice).toBeLessThan(growth.monthlyPrice);
    expect(growth.monthlyPrice).toBeLessThan(pro.monthlyPrice);

    // SMS-inclusive tiers outperform Basic (email-only) on no-show reduction
    expect(advanced.noShowReduction).toBeGreaterThan(basic.noShowReduction);

    expect(DEFAULT_PACKAGE_SLUG).toBe("advanced");

    // getPackage resolves valid slugs and falls back to the default for unknown ones
    expect(getPackage("basic")).toEqual(basic);
    expect(getPackage("growth")).toEqual(growth);
    expect(getPackage("pro")).toEqual(pro);
    expect(getPackage("nonexistent")).toEqual(advanced);

    // Backward-compatible aliases mirror the default (Advanced) package
    expect(NOSHOW_REDUCTION).toBe(advanced.noShowReduction);
    expect(LIME_MONTHLY_PRICE).toBe(advanced.monthlyPrice);

    // Every package has at least one headline feature
    for (const pkg of PACKAGES) {
      expect(pkg.features.length).toBeGreaterThan(0);
    }
  });

  // AC8: ADDONS have positive per-unit prices, and calculateAddonsTotal sums selected quantities
  // while treating missing/zero/negative quantities as 0.
  test("ADDONS pricing and calculateAddonsTotal (AC8)", () => {
    expect(ADDONS.length).toBeGreaterThan(0);
    for (const addon of ADDONS) {
      expect(addon.unitPrice).toBeGreaterThan(0);
    }

    expect(calculateAddonsTotal(undefined)).toBe(0);
    expect(calculateAddonsTotal({})).toBe(0);

    const extraUsers = ADDONS.find((a) => a.slug === "extraUsers")!;
    const extraLocations = ADDONS.find((a) => a.slug === "extraLocations")!;

    expect(calculateAddonsTotal({ extraUsers: 2 })).toBeCloseTo(extraUsers.unitPrice * 2, 5);
    expect(
      calculateAddonsTotal({ extraUsers: 1, extraLocations: 3 })
    ).toBeCloseTo(extraUsers.unitPrice * 1 + extraLocations.unitPrice * 3, 5);

    // Zero/negative quantities don't contribute
    expect(calculateAddonsTotal({ extraUsers: 0, extraLocations: -5 })).toBe(0);
  });
});
