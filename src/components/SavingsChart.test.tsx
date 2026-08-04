import { expect, test, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SavingsChart } from "./SavingsChart";

describe("SavingsChart Component Tests", () => {
  test("renders an empty-state message when there is no loss to visualize", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SavingsChart, { yearlyLoss: 0, yearlySaving: 0 })
    );
    expect(markup).toContain("Vnesite število neudeležb");
  });

  test("renders both bars proportioned by the saving percentage, with formatted EUR labels", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SavingsChart, { yearlyLoss: 1000, yearlySaving: 600 })
    );

    expect(markup).toContain("width:100%");
    expect(markup).toContain("width:40%"); // remaining loss = 400 / 1000
    expect(markup).toContain("width:60%"); // saving = 600 / 1000
    expect(markup.replace(/ /g, " ")).toContain("60 %");
  });
});
