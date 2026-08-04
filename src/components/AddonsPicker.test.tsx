import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AddonsPicker } from "./AddonsPicker";

describe("AddonsPicker Component Tests", () => {
  test("renders all 3 add-ons defaulting to quantity 0", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, { quantities: {}, onChange: vi.fn(), lang: "sl" })
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
      })
    );

    expect(markup).toMatch(/id="addon-qty-extraUsers"[^>]*>2</);
    expect(markup).toMatch(/id="addon-qty-extraResources"[^>]*>5</);
  });

  test("renders English add-on names when lang=en", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AddonsPicker, { quantities: {}, onChange: vi.fn(), lang: "en" })
    );

    expect(markup).toContain("Extra user");
    expect(markup).toContain("Extra location");
    expect(markup).toContain("Extra resource");
  });
});
