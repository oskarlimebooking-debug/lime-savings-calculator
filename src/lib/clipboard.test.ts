import { describe, expect, test, vi } from "vitest";
import { copyToClipboard } from "./clipboard";
import { parseParams, buildShareUrl, UrlState } from "./urlState";

describe("Clipboard copy handler and URL building (T3.3)", () => {
  const sampleState: UrlState = {
    category: "brivstvo",
    region: "celjska",
    noshows: 15,
    period: "weekly",
    pkg: "advanced",
    lang: "sl",
  };

  test("AC1: buildShareUrl produces a string that parseParams round-trips back to current state", () => {
    const baseUrl = "https://kalkulator.lime-booking.com/prihranek";
    const builtUrl = buildShareUrl(sampleState, baseUrl);

    // Assert that it built a full URL string starting with the base URL
    expect(builtUrl.startsWith(baseUrl)).toBe(true);
    expect(builtUrl).toContain("category=brivstvo");
    expect(builtUrl).toContain("region=celjska");
    expect(builtUrl).toContain("noshows=15");
    expect(builtUrl).toContain("period=weekly");
    expect(builtUrl).toContain("pkg=advanced");

    // Assert round-trip back to the original state
    const parsedState = parseParams(builtUrl);
    expect(parsedState).toEqual(sampleState);
  });

  test("AC2: Copy handler is a thin wrapper over an injectable clipboard fn; asserts the full URL string is passed", async () => {
    const mockClipboardFn = vi.fn().mockImplementation(async () => {
      // Mock success
    });

    const targetUrl = "https://lime-booking.com/?category=frizerstvo&region=celjska&noshows=5&period=monthly&pkg=advanced";
    await copyToClipboard(targetUrl, mockClipboardFn);

    expect(mockClipboardFn).toHaveBeenCalledTimes(1);
    expect(mockClipboardFn).toHaveBeenCalledWith(targetUrl);
  });

  test("AC3: Copy handler resolves/rejects without throwing synchronous error when clipboard mock rejects", async () => {
    const mockRejectingClipboard = vi.fn().mockImplementation(async () => {
      throw new Error("Clipboard write permission denied");
    });

    const targetUrl = "https://lime-booking.com/?category=frizerstvo";

    // Calling the copy handler with a rejecting mock should return a rejected promise
    // and NOT throw a synchronous exception.
    await expect(copyToClipboard(targetUrl, mockRejectingClipboard)).rejects.toThrow("Clipboard write permission denied");

    // Ensure it was called
    expect(mockRejectingClipboard).toHaveBeenCalledTimes(1);
  });
});
