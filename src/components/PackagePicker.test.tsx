import { expect, test, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PackagePicker } from "./PackagePicker";

describe("PackagePicker Component Tests", () => {
  test("renders the currently selected package with its price and SMS/email tagline", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "advanced", onChange: () => {} })
    );

    expect(markup).toContain('id="package-picker-trigger"');
    expect(markup).toContain("Advanced");
    expect(markup).toContain("29,90");
    expect(markup).toContain("SMS");
  });

  test("renders the Basic package as selected when value is basic", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "basic", onChange: () => {} })
    );

    expect(markup).toContain("Basic");
    expect(markup).toContain("14,90");
  });
});
