import { describe, it, expect, vi } from "vitest";
import { track, setAnalyticsSink } from "./analytics";

describe("analytics.ts", () => {
  it("calls the injected analytics sink with the exact event name for copy_link and cta_click", () => {
    const mockSink = {
      track: vi.fn(),
    };
    setAnalyticsSink(mockSink);

    track("copy_link");
    expect(mockSink.track).toHaveBeenCalledWith("copy_link", undefined);

    track("cta_click");
    expect(mockSink.track).toHaveBeenCalledWith("cta_click", undefined);
  });

  it("fails typecheck when passing an unknown event", () => {
    // @ts-expect-error: "unknown_event" is not a valid AnalyticsEvent
    track("unknown_event");
  });
});
