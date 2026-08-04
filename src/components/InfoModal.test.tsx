import { expect, test, describe, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InfoModal, InfoTrigger } from "./InfoModal";

describe("InfoModal Component Tests", () => {
  test("renders nothing when closed", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoModal, { packageSlug: "advanced", open: false, onClose: vi.fn(), lang: "sl" })
    );
    expect(markup).toBe("");
  });

  test("renders SMS vs email explanation and sources when open (sl)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoModal, { packageSlug: "advanced", open: true, onClose: vi.fn(), lang: "sl" })
    );

    expect(markup).toContain('id="info-modal-panel"');
    expect(markup).toContain("SMS proti e-pošti");
    expect(markup).toContain("Osnovni");
    expect(markup).toContain("Napredni");
    expect(markup).toContain("uradnem ceniku");
  });

  test("renders English translations when lang=en", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoModal, { packageSlug: "advanced", open: true, onClose: vi.fn(), lang: "en" })
    );

    expect(markup).toContain("SMS vs. email");
    expect(markup).toContain("Basic");
    expect(markup).toContain("Advanced");
  });

  test("InfoTrigger renders an accessible clickable eye icon button", () => {
    const markup = renderToStaticMarkup(React.createElement(InfoTrigger, { onClick: () => {} }));
    expect(markup).toContain('id="info-modal-trigger"');
    expect(markup).toContain("<svg");
  });
});
