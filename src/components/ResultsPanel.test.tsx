import { expect, test, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultsPanel } from "./ResultsPanel";

describe("ResultsPanel Component Tests", () => {
  test("renders all metrics, ROI highlight label, and the source footnote (AC4)", () => {
    const props = {
      monthlyLoss: 120,
      yearlyLoss: 1440,
      yearlySaving: 864,
      roiMonths: 0.5,
      roiTier: "green" as const,
    };

    const markup = renderToStaticMarkup(React.createElement(ResultsPanel, props));

    // Renders monthly and yearly loss
    // Normalized check to handle potential spacing differences in locale formatting
    const normalized = markup.replace(/ /g, " ");
    expect(normalized).toContain("120,00");
    expect(normalized).toContain("1.440,00");
    expect(normalized).toContain("864,00");

    // Renders the ROI label in days, converted from months (0.5 months x 30 = 15 days) (AC2)
    expect(normalized).toContain("Lime Booking se povrne v 15 dneh");

    // Renders the green tier class name (AC3)
    expect(markup).toContain("roi-success");

    // Green tier does not render the honest "doesn't pay off yet" value-add callout
    expect(markup).not.toContain('id="results-value-add"');

    // Renders the default footnote text (AC4)
    expect(markup).toContain("Zmanjšanje neudeležb za 60 %");
  });

  test("renders warning tier layout, honest ROI copy, value-add callout, and custom footnote", () => {
    const props = {
      monthlyLoss: 0,
      yearlyLoss: 0,
      yearlySaving: 0,
      roiMonths: Infinity,
      roiTier: "warning" as const,
      footnote: "Custom study source footnote",
    };

    const markup = renderToStaticMarkup(React.createElement(ResultsPanel, props));
    const normalized = markup.replace(/ /g, " ");

    // Renders dash for infinity days (AC2 / AC3)
    expect(normalized).toContain("Lime Booking se povrne v - dneh");

    // Renders the warning class name (AC3)
    expect(markup).toContain("warning");

    // Warning tier is honest that the subscription doesn't pay off within 30 days
    // and suggests a smaller package
    expect(markup).toContain("30 dneh");
    expect(markup).toContain("manjši paket");

    // Renders the value-add callout (new customer acquisition, platform listing)
    expect(markup).toContain('id="results-value-add"');
    expect(markup).toContain("Lime Booking prinaša še več");
    expect(markup).toContain("pridobivanju novih strank");

    // Renders custom footnote (AC4)
    expect(markup).toContain("Custom study source footnote");
  });
});
