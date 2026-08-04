import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceInput } from "./PriceInput";

describe("PriceInput Component Tests", () => {
  test("renders the default price without a reset button when not customized", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PriceInput, {
        value: 45,
        defaultPrice: 45,
        isCustom: false,
        onChange: vi.fn(),
        onReset: vi.fn(),
        lang: "sl",
      })
    );

    expect(markup).toContain('id="price-input-numeric"');
    expect(markup).toContain('value="45"');
    expect(markup).not.toContain('id="price-input-reset"');
  });

  test("renders a reset-to-default control when the price has been customized", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PriceInput, {
        value: 60,
        defaultPrice: 45,
        isCustom: true,
        onChange: vi.fn(),
        onReset: vi.fn(),
        lang: "sl",
      })
    );

    expect(markup).toContain('value="60"');
    expect(markup).toContain('id="price-input-reset"');
    expect(markup).toContain("45,00");
  });
});
