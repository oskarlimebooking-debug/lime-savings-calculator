import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AddonsPicker } from "./AddonsPicker";

describe("AddonsPicker Component Tests", () => {
  test("renders all 3 add-ons defaulting to quantity 0", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, {
        quantities: {},
        onChange: vi.fn(),
        lang: "sl",
        basePrice: 29.9,
        packageName: "Napredni",
      })
    );

    expect(markup).toContain('id="addon-row-extraUsers"');
    expect(markup).toContain('id="addon-row-extraLocations"');
    expect(markup).toContain('id="addon-row-extraResources"');
    expect(markup).toContain("Dodatni uporabnik");
    expect(markup).toContain("Dodatna lokacija");
    expect(markup).toContain("Dodatno sredstvo");

    // All quantities default to 0
    const zeroCount = (markup.match(/>0</g) || []).length;
    expect(zeroCount).toBeGreaterThanOrEqual(3);
  });

  test("reflects non-zero quantities from props", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, {
        quantities: { extraUsers: 2, extraLocations: 0, extraResources: 5 },
        onChange: vi.fn(),
        lang: "sl",
        basePrice: 29.9,
        packageName: "Napredni",
      })
    );

    expect(markup).toMatch(/id="addon-qty-extraUsers"[^>]*>2</);
    expect(markup).toMatch(/id="addon-qty-extraResources"[^>]*>5</);
  });

  test("renders English add-on names when lang=en", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, {
        quantities: {},
        onChange: vi.fn(),
        lang: "en",
        basePrice: 29.9,
        packageName: "Advanced",
      })
    );

    expect(markup).toContain("Extra user");
    expect(markup).toContain("Extra location");
    expect(markup).toContain("Extra resource");
  });

  // AC: the total price summary reflects the base package price with no add-ons selected,
  // and updates to include add-on costs once quantities are non-zero (this is the fix for
  // "add-ons don't change the price" — the total must be visibly displayed and live-updating).
  test("total price summary reflects base price with no add-ons", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, {
        quantities: {},
        onChange: vi.fn(),
        lang: "sl",
        basePrice: 29.9,
        packageName: "Napredni",
      })
    );

    expect(markup).toContain('id="addons-total-summary"');
    expect(markup).toMatch(/id="addons-total-price"[^>]*>29,90\s*€\/mesec</);
    expect(markup).toContain("paket Napredni");
  });

  test("total price summary includes add-on cost once quantities are non-zero", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, {
        quantities: { extraUsers: 2, extraLocations: 1 },
        onChange: vi.fn(),
        lang: "sl",
        basePrice: 29.9,
        packageName: "Napredni",
      })
    );

    // 29.90 base + 2*9.90 (extraUsers) + 1*9.90 (extraLocations) = 59.60
    expect(markup).toMatch(/id="addons-total-price"[^>]*>59,60\s*€\/mesec</);
  });
});
