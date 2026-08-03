import { expect, test, describe } from "vitest";
import {
  parseParams,
  toQueryString,
  DEFAULT_CATEGORY,
  DEFAULT_REGION,
  DEFAULT_NOSHOWS,
  DEFAULT_PERIOD,
  coerceNoShows,
  UrlState,
  SearchParamsInput,
} from "./urlState";
import { CATEGORIES, REGIONS } from "./data";

describe("URL state serialization and parsing (T2.1)", () => {
  // AC1: parseParams(toQueryString(state)) deep-equals the original valid state (round-trip vitest)
  test("AC1: round-trip parsing of valid states matches original input", () => {
    const statesToTest: UrlState[] = [
      {
        category: "frizerstvo",
        region: "osrednjeslovenska",
        noshows: 10,
        period: "monthly",
      },
      {
        category: "brivstvo",
        region: "celjska",
        noshows: 0,
        period: "weekly",
      },
      {
        category: "kozmeticni-saloni",
        region: "primorska",
        noshows: 99,
        period: "monthly",
      },
      {
        category: "druge-lepotne-storitve",
        region: "ostalo",
        noshows: 5,
        period: "weekly",
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
    });
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
