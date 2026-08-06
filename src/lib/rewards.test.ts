import { describe, it, expect } from "vitest";
import {
  REWARDS,
  TIER_ORDER,
  TIER_BOUNDS,
  KNOWN_HOSTS,
  CHEAPEST_REWARD_PRICE,
  RewardTier,
} from "./rewards";
import { LANGUAGES } from "./i18n";

describe("REWARDS catalogue", () => {
  it("has a healthy total size", () => {
    expect(REWARDS.length).toBeGreaterThanOrEqual(60);
  });

  it("uses unique kebab-case ids", () => {
    const ids = REWARDS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("prices every item with a positive finite number", () => {
    for (const r of REWARDS) {
      expect(Number.isFinite(r.price), r.id).toBe(true);
      expect(r.price, r.id).toBeGreaterThan(0);
    }
  });

  it("places every item inside its tier's price band", () => {
    for (const r of REWARDS) {
      const [min, max] = TIER_BOUNDS[r.tier];
      expect(r.price, `${r.id} (${r.tier})`).toBeGreaterThanOrEqual(min);
      expect(r.price, `${r.id} (${r.tier})`).toBeLessThan(max);
    }
  });

  it("fills every tier with enough items to keep shuffles varied", () => {
    for (const tier of TIER_ORDER) {
      const count = REWARDS.filter((r) => r.tier === tier).length;
      expect(count, tier).toBeGreaterThanOrEqual(6);
    }
  });

  it("translates every label into all four languages", () => {
    for (const r of REWARDS) {
      for (const { code } of LANGUAGES) {
        const label = r.label[code];
        expect(typeof label, `${r.id}.${code}`).toBe("string");
        expect(label.trim().length, `${r.id}.${code}`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every item an emoji and a retailer", () => {
    for (const r of REWARDS) {
      expect(r.emoji.trim().length, r.id).toBeGreaterThan(0);
      expect(r.retailer.trim().length, r.id).toBeGreaterThan(0);
    }
  });

  it("only links to https hosts we have verified", () => {
    for (const r of REWARDS) {
      expect(r.url.startsWith("https://"), `${r.id}: ${r.url}`).toBe(true);
      const host = new URL(r.url).host;
      expect(KNOWN_HOSTS, `${r.id}: ${host}`).toContain(host);
    }
  });

  it("never uses a SKU deep link (those rot within months)", () => {
    for (const r of REWARDS) {
      const path = new URL(r.url).pathname;
      expect(path, r.id).not.toMatch(/\/p\//);
      expect(path, r.id).not.toMatch(/\/product\//);
      expect(path, r.id).not.toMatch(/\d{4,}/);
    }
  });

  it("has no duplicate retailer + Slovenian label pair", () => {
    const pairs = REWARDS.map((r) => `${r.retailer}::${r.label.sl}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("exposes the cheapest price", () => {
    expect(CHEAPEST_REWARD_PRICE).toBe(Math.min(...REWARDS.map((r) => r.price)));
  });

  it("orders tiers by ascending price band", () => {
    let prevMax = 0;
    for (const tier of TIER_ORDER as readonly RewardTier[]) {
      const [min, max] = TIER_BOUNDS[tier];
      expect(min).toBeGreaterThanOrEqual(prevMax);
      prevMax = max;
    }
  });
});
