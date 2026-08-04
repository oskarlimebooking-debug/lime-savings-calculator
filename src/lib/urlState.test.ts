import { expect, test, describe } from "vitest";
import {
  parseParams,
  toQueryString,
  DEFAULT_CATEGORY,
  DEFAULT_REGION,
  DEFAULT_NOSHOWS,
  DEFAULT_PERIOD,
  DEFAULT_PKG,
  DEFAULT_LANG_STATE,
  coerceNoShows,
  coerceCustomPrice,
  coerceAddonQty,
  UrlState,
  SearchParamsInput,
} from "./urlState";
import { CATEGORIES, REGIONS, PACKAGES } from "./data";
import { LANGUAGES } from "./i18n";

describe("URL state serialization and parsing (T2.1)", () => {
  // AC1: parseParams(toQueryString(state)) deep-equals the original valid state (round-trip vitest)
  test("AC1: round-trip parsing of valid states matches original input", () => {
    const statesToTest: UrlState[] = [
      {
        category: "frizerstvo",
        region: "osrednjeslovenska",
        noshows: 10,
        period: "monthly",
        pkg: "advanced",
        lang: "sl",
      },
      {
        category: "brivstvo",
        region: "celjska",
        noshows: 0,
        period: "weekly",
        pkg: "basic",
        lang: "en",
      },
      {
        category: "kozmeticni-saloni",
        region: "primorska",
        noshows: 99,
        period: "monthly",
        pkg: "growth",
        lang: "hr",
      },
      {
        category: "druge-lepotne-storitve",
        region: "ostalo",
        noshows: 5,
        period: "weekly",
        pkg: "pro",
        lang: "sr",
      },
      {
        category: "frizerstvo",
        region: "gorenjska",
        noshows: 8,
        period: "monthly",
        pkg: "advanced",
        lang: "sl",
        customPrice: 33.5,
        extraUsers: 2,
        extraLocations: 1,
        extraResources: 3,
      },
    ];

    for (const state of statesToTest) {
      const queryString = toQueryString(state);
      expect(queryString.startsWith("?")).toBe(true);

      const parsedState = parseParams(queryString);
      expect(parsedState).toEqual(state);

      // Test with URLSearchParams object
      const urlParams = new URLSearchParams(queryString);
      expect(parseParams(urlParams)).toEqual(state);

      // Test with Record object
      const recordParams: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        recordParams[key] = value;
      });
      expect(parseParams(recordParams)).toEqual(state);
    }
  });

  // AC2: Invalid/missing params resolve to documented defaults, never throw (asserted with garbage input)
  test("AC2: invalid or missing params resolve to defaults and never throw", () => {
    const expectedDefaultState: UrlState = {
      category: DEFAULT_CATEGORY,
      region: DEFAULT_REGION,
      noshows: DEFAULT_NOSHOWS,
      period: DEFAULT_PERIOD,
      pkg: DEFAULT_PKG,
      lang: DEFAULT_LANG_STATE,
    };

    expect(() => parseParams(null)).not.toThrow();
    expect(parseParams(null)).toEqual(expectedDefaultState);

    expect(() => parseParams(undefined)).not.toThrow();
    expect(parseParams(undefined)).toEqual(expectedDefaultState);

    expect(() => parseParams("")).not.toThrow();
    expect(parseParams("")).toEqual(expectedDefaultState);

    expect(() => parseParams("?")).not.toThrow();
    expect(parseParams("?")).toEqual(expectedDefaultState);

    expect(() => parseParams("?random=garbage&another=one")).not.toThrow();
    expect(parseParams("?random=garbage&another=one")).toEqual(expectedDefaultState);

    const garbageRecord = {
      category: ["array-val", "second-val"],
      region: undefined,
      noshows: "not-a-number",
      period: "daily", // invalid period
    };
    expect(() => parseParams(garbageRecord as unknown as SearchParamsInput)).not.toThrow();
    expect(parseParams(garbageRecord as unknown as SearchParamsInput)).toEqual({
      category: DEFAULT_CATEGORY, // "array-val" is invalid enum -> default
      region: DEFAULT_REGION, // undefined -> default
      noshows: 0, // "not-a-number" -> 0
      period: DEFAULT_PERIOD, // "daily" is invalid -> default
      pkg: DEFAULT_PKG, // absent -> default
      lang: DEFAULT_LANG_STATE, // absent -> default
    });
  });

  // AC5: pkg param round-trips and falls back to the default package for unknown values;
  // customPrice round-trips only when present and validly positive.
  test("AC5: pkg validation/defaulting and customPrice coercion", () => {
    expect(parseParams("?pkg=basic").pkg).toBe("basic");
    expect(parseParams("?pkg=advanced").pkg).toBe("advanced");
    expect(parseParams("?pkg=unknown-package").pkg).toBe(DEFAULT_PKG);
    expect(parseParams(null).pkg).toBe(DEFAULT_PKG);
    expect(PACKAGES.map((p) => p.slug)).toContain(DEFAULT_PKG);

    expect(coerceCustomPrice(45.5)).toBe(45.5);
    expect(coerceCustomPrice("45.5")).toBe(45.5);
    expect(coerceCustomPrice(45.999)).toBe(46);
    expect(coerceCustomPrice(0)).toBeUndefined();
    expect(coerceCustomPrice(-10)).toBeUndefined();
    expect(coerceCustomPrice("not-a-number")).toBeUndefined();
    expect(coerceCustomPrice(undefined)).toBeUndefined();
    expect(coerceCustomPrice(NaN)).toBeUndefined();

    expect(parseParams("?price=39.5").customPrice).toBe(39.5);
    expect(parseParams("?price=-5").customPrice).toBeUndefined();
    expect(parseParams("?price=abc").customPrice).toBeUndefined();
    expect(parseParams(null).customPrice).toBeUndefined();

    const withPrice = toQueryString({ customPrice: 42 });
    expect(withPrice).toContain("price=42");
    expect(parseParams(withPrice).customPrice).toBe(42);

    const withoutPrice = toQueryString({});
    expect(withoutPrice).not.toContain("price=");
    expect(parseParams(withoutPrice).customPrice).toBeUndefined();
  });

  // AC6: lang param round-trips, falls back to the default (sl) for unknown values, and is
  // always present in the query string; add-on quantities round-trip and are omitted at 0.
  test("AC6: lang validation/defaulting and add-on quantity coercion", () => {
    for (const language of LANGUAGES) {
      expect(parseParams(`?lang=${language.code}`).lang).toBe(language.code);
    }
    expect(parseParams("?lang=xx").lang).toBe(DEFAULT_LANG_STATE);
    expect(parseParams(null).lang).toBe(DEFAULT_LANG_STATE);
    expect(toQueryString({})).toContain(`lang=${DEFAULT_LANG_STATE}`);

    expect(coerceAddonQty(3)).toBe(3);
    expect(coerceAddonQty("3")).toBe(3);
    expect(coerceAddonQty(0)).toBeUndefined();
    expect(coerceAddonQty(-2)).toBeUndefined();
    expect(coerceAddonQty(undefined)).toBeUndefined();
    expect(coerceAddonQty("not-a-number")).toBeUndefined();

    const withAddons = toQueryString({ extraUsers: 2, extraLocations: 0, extraResources: 1 });
    expect(withAddons).toContain("extraUsers=2");
    expect(withAddons).not.toContain("extraLocations=");
    expect(withAddons).toContain("extraResources=1");

    const parsedAddons = parseParams(withAddons);
    expect(parsedAddons.extraUsers).toBe(2);
    expect(parsedAddons.extraLocations).toBeUndefined();
    expect(parsedAddons.extraResources).toBe(1);

    expect(parseParams(null).extraUsers).toBeUndefined();
  });

  // AC3: noshows is coerced to a non-negative integer; negatives/NaN clamp to 0 (asserted)
  test("AC3: noshows is coerced to a non-negative integer and negatives/NaN clamp to 0", () => {
    // Test helper directly
    expect(coerceNoShows(-5)).toBe(0);
    expect(coerceNoShows(NaN)).toBe(0);
    expect(coerceNoShows(undefined)).toBe(0);
    expect(coerceNoShows("invalid")).toBe(0);
    expect(coerceNoShows("-10")).toBe(0);
    expect(coerceNoShows("15.5")).toBe(15);
    expect(coerceNoShows(12.7)).toBe(12);
    expect(coerceNoShows(0)).toBe(0);
    expect(coerceNoShows(100)).toBe(100);

    // Test through parseParams
    expect(parseParams("?noshows=-12").noshows).toBe(0);
    expect(parseParams("?noshows=NaN").noshows).toBe(0);
    expect(parseParams("?noshows=abc").noshows).toBe(0);
    expect(parseParams("?noshows=5.7").noshows).toBe(5);
    expect(parseParams({ noshows: -45 } as unknown as SearchParamsInput).noshows).toBe(0);
    expect(parseParams({ noshows: 23.9 } as unknown as SearchParamsInput).noshows).toBe(23);
  });

  // AC4: Unknown category/region enum values fall back to the first valid option (asserted)
  test("AC4: unknown category/region enum values fall back to the first valid option", () => {
    const defaultCatSlug = CATEGORIES[0].slug;
    const defaultRegSlug = REGIONS[0].slug;

    const result = parseParams("?category=unknown-cat&region=unknown-reg");
    expect(result.category).toBe(defaultCatSlug);
    expect(result.region).toBe(defaultRegSlug);

    const resultRecord = parseParams({
      category: "invalid-category",
      region: "invalid-region",
    });
    expect(resultRecord.category).toBe(defaultCatSlug);
    expect(resultRecord.region).toBe(defaultRegSlug);
  });
});
