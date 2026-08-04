import { expect, test, describe } from "vitest";
import { buildMetadata } from "./metadata";
import { UrlState } from "./urlState";
import { CATEGORIES, REGIONS } from "./data";

describe("Dynamic SEO metadata (T2.2)", () => {
  // AC1: buildMetadata for a known state returns a title containing the localized category, region, and the computed euro figure
  test("AC1: title contains localized category, region, and correct yearly loss figure", () => {
    // Test Case 1: Monthly period
    const state1: UrlState = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 10,
      period: "monthly",
      pkg: "advanced",
    };
    // Expected yearly loss: 10 * 45 (price) = 450 monthly; 450 * 12 = 5400 yearly
    const meta1 = buildMetadata(state1);
    expect(meta1.title).toBe("Frizerstvo v Osrednjeslovenska: letna izguba €5.400 | Lime Savings Calculator");

    // Test Case 2: Weekly period with decimal calculation
    const state2: UrlState = {
      category: "brivstvo",
      region: "celjska",
      noshows: 3,
      period: "weekly",
      pkg: "basic",
    };
    // Expected monthly no-shows: 3 * 4.33 = 12.99
    // Expected monthly loss: 12.99 * 20 (price) = 259.8
    // Expected yearly loss: 259.8 * 12 = 3117.6 -> rounded to 3118
    const meta2 = buildMetadata(state2);
    expect(meta2.title).toBe("Brivstvo v Celjska: letna izguba €3.118 | Lime Savings Calculator");
  });

  // AC2: Returned object includes openGraph.title, openGraph.description, and openGraph.images (asserted non-empty)
  test("AC2: returned object has all expected Open Graph properties and is non-empty", () => {
    const state: UrlState = {
      category: "kozmeticni-saloni",
      region: "maribor",
      noshows: 5,
      period: "monthly",
      pkg: "advanced",
    };
    const meta = buildMetadata(state);

    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph.title).toBe(meta.title);
    expect(meta.openGraph.description).toBe(meta.description);
    expect(Array.isArray(meta.openGraph.images)).toBe(true);
    expect(meta.openGraph.images.length).toBeGreaterThan(0);
    expect(meta.openGraph.images[0].url).toBeTruthy();
  });

  // AC3: description is <= 160 characters (asserted for all combinations)
  test("AC3: description is <= 160 characters for all possible category and region combinations", () => {
    for (const category of CATEGORIES) {
      for (const region of REGIONS) {
        const state: UrlState = {
          category: category.slug,
          region: region.slug,
          noshows: 999999, // Extremely large number of no-shows to maximize characters
          period: "weekly",
          pkg: "advanced",
        };
        const meta = buildMetadata(state);
        expect(meta.description.length).toBeLessThanOrEqual(160);
      }
    }
  });
});
