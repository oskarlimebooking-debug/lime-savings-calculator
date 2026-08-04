import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguagePicker } from "./LanguagePicker";

describe("LanguagePicker Component Tests", () => {
  test("renders the currently selected language in the trigger", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LanguagePicker, { value: "sl", onChange: vi.fn() })
    );

    expect(markup).toContain('id="language-picker-trigger"');
    expect(markup).toContain("Slovenščina");
  });

  test("renders each language option id for every supported language", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LanguagePicker, { value: "en", onChange: vi.fn() })
    );

    expect(markup).toContain("English");
    // Menu is closed by default (only the trigger renders on first paint)
    expect(markup).not.toContain('id="language-picker-option-sl"');
  });
});
