import { expect, test, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PackagePicker } from "./PackagePicker";

describe("PackagePicker Component Tests", () => {
  test("renders the currently selected package with its price and SMS/email tagline", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "advanced", onChange: () => {}, lang: "sl" })
    );

    expect(markup).toContain('id="package-picker-trigger"');
    expect(markup).toContain("Napredni");
    expect(markup).toContain("29,90");
    expect(markup).toContain("SMS");
    expect(markup).toContain("Priporočeno");
  });

  test("renders the Basic package as selected when value is basic", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "basic", onChange: () => {}, lang: "sl" })
    );

    expect(markup).toContain("Osnovni");
    expect(markup).toContain("14,90");
  });

  test("renders Growth and Pro tiers when selected", () => {
    const growthMarkup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "growth", onChange: () => {}, lang: "sl" })
    );
    expect(growthMarkup).toContain("Growth");
    expect(growthMarkup).toContain("49,90");

    const proMarkup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "pro", onChange: () => {}, lang: "sl" })
    );
    expect(proMarkup).toContain("Pro");
    expect(proMarkup).toContain("69,90");
  });

  test("renders English package names and recommended label when lang=en", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PackagePicker, { value: "advanced", onChange: () => {}, lang: "en" })
    );

    expect(markup).toContain("Advanced");
    expect(markup).toContain("Recommended");
    expect(markup).toContain("/month");
  });
});
