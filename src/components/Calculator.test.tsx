import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Calculator } from "./Calculator";
import { LANG_TO_URL } from "../lib/i18n";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      replace: vi.fn(),
    };
  },
}));

describe("Calculator Component Tests", () => {
  test("CTA href resolves to the language-specific Lime Booking URL (AC3)", () => {
    const initialState = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 5,
      period: "monthly" as const,
      pkg: "advanced" as const,
      lang: "sl" as const,
    };

    const markup = renderToStaticMarkup(React.createElement(Calculator, { initialState }));

    // Slovenian language selection should point the CTA at the Slovenian site
    expect(markup).toContain(`href="${LANG_TO_URL.sl}"`);
    expect(markup).toContain('id="cta-register-button"');
  });

  test("CTA href switches per language (hr/sr/en)", () => {
    for (const lang of ["hr", "sr", "en"] as const) {
      const initialState = {
        category: "frizerstvo",
        region: "osrednjeslovenska",
        noshows: 5,
        period: "monthly" as const,
        pkg: "advanced" as const,
        lang,
      };
      const markup = renderToStaticMarkup(React.createElement(Calculator, { initialState }));
      expect(markup).toContain(`href="${LANG_TO_URL[lang]}"`);
    }
  });

  test("renders the rewards band as a full-width section below the results panel", () => {
    const initialState = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 20,
      period: "monthly" as const,
      pkg: "advanced" as const,
      lang: "sl" as const,
    };

    const markup = renderToStaticMarkup(React.createElement(Calculator, { initialState }));

    expect(markup).toContain('id="rewards-section"');
    expect(markup).toContain('id="reward-card-0"');
    expect(markup.indexOf('id="rewards-section"')).toBeGreaterThan(
      markup.indexOf('id="results-panel-container"')
    );
  });
});
