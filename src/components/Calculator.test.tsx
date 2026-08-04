import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Calculator } from "./Calculator";
import { LIME_BOOKING_URL } from "../lib/data";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      replace: vi.fn(),
    };
  },
}));

describe("Calculator Component Tests", () => {
  test("CTA href resolves to the configured Lime Booking URL constant (AC3)", () => {
    const initialState = {
      category: "frizerstvo",
      region: "osrednjeslovenska",
      noshows: 5,
      period: "monthly" as const,
      pkg: "advanced" as const,
    };

    const markup = renderToStaticMarkup(React.createElement(Calculator, { initialState }));
    
    // We expect the link with id cta-register-button to have href equal to LIME_BOOKING_URL
    expect(markup).toContain(`href="${LIME_BOOKING_URL}"`);
    expect(markup).toContain('id="cta-register-button"');
  });
});
