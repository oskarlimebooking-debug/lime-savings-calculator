import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEvent =
  | "copy_link"
  | "cta_click"
  | "reward_shuffle"
  | "reward_click";

export interface AnalyticsSink {
  track: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
}

let activeSink: AnalyticsSink = {
  track: (event, properties) => {
    try {
      vercelTrack(event, properties);
    } catch (e) {
      console.warn("Vercel analytics failed to track event:", event, e);
    }
  }
};

/**
 * Injects a custom analytics sink (for testing or overrides).
 */
export function setAnalyticsSink(sink: AnalyticsSink) {
  activeSink = sink;
}

/**
 * Tracks a custom analytics event.
 * Event-name constants are a closed union — see AnalyticsEvent.
 */
export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | null>) {
  activeSink.track(event, properties);
}
