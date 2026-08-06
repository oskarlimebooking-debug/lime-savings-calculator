import { expect, test, describe } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RewardsSection } from "./RewardsSection";
import { LANGUAGES, getTranslations } from "../lib/i18n";

const render = (yearlySaving: number, lang: "sl" | "hr" | "sr" | "en" = "sl") =>
  renderToStaticMarkup(React.createElement(RewardsSection, { yearlySaving, lang }));

describe("RewardsSection", () => {
  test("renders the section scaffolding with three reward cards", () => {
    const markup = render(8640);

    expect(markup).toContain('id="rewards-section"');
    expect(markup).toContain('id="rewards-heading"');
    expect(markup).toContain('id="rewards-list"');
    expect(markup).toContain('id="rewards-shuffle-button"');
    expect(markup).toContain('id="rewards-disclaimer"');

    expect(markup).toContain('id="reward-card-0"');
    expect(markup).toContain('id="reward-card-1"');
    expect(markup).toContain('id="reward-card-2"');
    expect(markup).not.toContain('id="reward-card-3"');
  });

  test("announces the revealed trio politely", () => {
    expect(render(8640)).toContain('aria-live="polite"');
  });

  test("links out safely to https destinations only", () => {
    const markup = render(8640);
    const hrefs = (markup.match(/href="[^"]+"/g) ?? []).map((m) => m.slice(6, -1));

    expect(hrefs.length).toBe(3);
    for (const href of hrefs) {
      expect(href.startsWith("https://"), href).toBe(true);
    }
    expect((markup.match(/target="_blank"/g) ?? []).length).toBe(3);
    expect((markup.match(/rel="noopener noreferrer"/g) ?? []).length).toBe(3);
  });

  test("shows quantity multipliers when the saving affords several of an item", () => {
    // 40.000 EUR affords many of the cheap tier, so at least one card multiplies.
    expect(render(40_000)).toContain("×");
  });

  test("shows the empty-state nudge instead of cards at zero saving", () => {
    const markup = render(0);

    expect(markup).toContain('id="rewards-empty"');
    expect(markup).not.toContain('id="reward-card-0"');
    expect(markup).not.toContain('id="rewards-shuffle-button"');
    // The heading and the disclaimer still anchor the section.
    expect(markup).toContain('id="rewards-heading"');
  });

  test("renders its heading in every supported language", () => {
    for (const { code } of LANGUAGES) {
      const markup = render(8640, code);
      const { heading } = getTranslations(code).rewards;
      // React escapes apostrophes, so compare on the leading clause only.
      expect(markup, code).toContain(heading.split("'")[0]);
    }
  });

  test("is stable across renders (no Math.random in the render path)", () => {
    expect(render(8640)).toBe(render(8640));
    expect(render(123_456, "en")).toBe(render(123_456, "en"));
  });
});
