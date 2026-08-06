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

  it("forwards reward events with their properties", () => {
    const mockSink = {
      track: vi.fn(),
    };
    setAnalyticsSink(mockSink);

    track("reward_shuffle", { saving: 8640 });
    expect(mockSink.track).toHaveBeenCalledWith("reward_shuffle", { saving: 8640 });

    track("reward_click", {
      reward_id: "macbook-air",
      tier: "big",
      category: "tech",
      retailer: "Mimovrste",
      quantity: 1,
    });
    expect(mockSink.track).toHaveBeenCalledWith("reward_click", {
      reward_id: "macbook-air",
      tier: "big",
      category: "tech",
      retailer: "Mimovrste",
      quantity: 1,
    });
  });

  it("fails typecheck when passing an unknown event", () => {
    // @ts-expect-error: "unknown_event" is not a valid AnalyticsEvent
    track("unknown_event");
  });
});
