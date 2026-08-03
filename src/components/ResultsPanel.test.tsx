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
      roiMonths: 1.5,
      roiTier: "green" as const,
    };

    const markup = renderToStaticMarkup(React.createElement(ResultsPanel, props));

    // Renders monthly and yearly loss
    // Normalized check to handle potential spacing differences in locale formatting
    const normalized = markup.replace(/\u00a0/g, " ");
    expect(normalized).toContain("120,00");
    expect(normalized).toContain("1.440,00");
    expect(normalized).toContain("864,00");

    // Renders the ROI label with correct formatted number (AC2)
    expect(normalized).toContain("Lime Booking se povrne v 1,5 mesecih");

    // Renders the green tier class name (AC3)
    expect(markup).toContain("lime-green");

    // Renders the default footnote text (AC4)
    expect(markup).toContain("Zmanjšanje neudeležb za 60 %");
  });

  test("renders warning tier layout and custom footnote", () => {
    const props = {
      monthlyLoss: 0,
      yearlyLoss: 0,
      yearlySaving: 0,
      roiMonths: Infinity,
      roiTier: "warning" as const,
      footnote: "Custom study source footnote",
    };

    const markup = renderToStaticMarkup(React.createElement(ResultsPanel, props));
    const normalized = markup.replace(/\u00a0/g, " ");

    // Renders dash for infinity months (AC2 / AC3)
    expect(normalized).toContain("Lime Booking se povrne v - mesecih");

    // Renders the warning class name (AC3)
    expect(markup).toContain("warning");

    // Renders custom footnote (AC4)
    expect(markup).toContain("Custom study source footnote");
  });
});
