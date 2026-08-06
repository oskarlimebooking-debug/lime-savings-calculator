import { describe, it, expect } from "vitest";
import {
  mulberry32,
  pickRewards,
  buildReel,
  showsLeftover,
  MAX_QUANTITY,
  REEL_ROWS,
} from "./rewardPicker";
import { REWARDS, CHEAPEST_REWARD_PRICE } from "./rewards";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const first = Array.from({ length: 10 }, () => a());
    const second = Array.from({ length: 10 }, () => b());
    expect(first).toEqual(second);
  });

  it("produces values inside [0, 1)", () => {
    const rng = mulberry32(1234);
    for (let i = 0; i < 500; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("diverges for different seeds", () => {
    const a = Array.from({ length: 5 }, mulberry32(1));
    const b = Array.from({ length: 5 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it("is not degenerate at seed 0", () => {
    const rng = mulberry32(0);
    const values = Array.from({ length: 20 }, () => rng());
    expect(new Set(values).size).toBeGreaterThan(15);
  });
});

describe("pickRewards", () => {
  it("returns nothing when the budget is unusable", () => {
    for (const saving of [0, -100, NaN, Infinity, -Infinity, 5]) {
      expect(pickRewards(saving, 1), String(saving)).toEqual([]);
    }
  });

  it("returns nothing below the cheapest reward", () => {
    expect(pickRewards(CHEAPEST_REWARD_PRICE - 1, 3)).toEqual([]);
  });

  it("is deterministic for the same arguments", () => {
    expect(pickRewards(8640, 7)).toEqual(pickRewards(8640, 7));
  });

  it("returns three picks for any realistic saving", () => {
    for (const saving of [200, 1200, 8640, 42_000, 200_000]) {
      expect(pickRewards(saving, 11).length, String(saving)).toBe(3);
    }
  });

  it("keeps every pick affordable and internally consistent", () => {
    for (let seed = 1; seed <= 20; seed++) {
      for (const saving of [150, 900, 5000, 33_000, 180_000]) {
        const budget = Math.floor(saving);
        for (const pick of pickRewards(saving, seed)) {
          expect(pick.quantity).toBeGreaterThanOrEqual(1);
          expect(pick.quantity).toBeLessThanOrEqual(MAX_QUANTITY);
          expect(pick.totalCost).toBe(pick.quantity * pick.reward.price);
          expect(pick.totalCost).toBeLessThanOrEqual(budget);
          expect(pick.leftover).toBe(budget - pick.totalCost);
          expect(pick.leftover).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("never repeats a reward inside one trio", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const picks = pickRewards(60_000, seed);
      expect(new Set(picks.map((p) => p.reward.id)).size).toBe(picks.length);
    }
  });

  it("mixes three distinct tiers when the budget spans them", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const picks = pickRewards(60_000, seed);
      expect(new Set(picks.map((p) => p.reward.tier)).size, `seed ${seed}`).toBe(3);
    }
  });

  it("orders picks ascending by price", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const prices = pickRewards(40_000, seed).map((p) => p.reward.price);
      expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    }
  });

  it("forces quantity 1 for singleOnly rewards", () => {
    for (let seed = 1; seed <= 60; seed++) {
      for (const pick of pickRewards(200_000, seed)) {
        if (pick.reward.singleOnly) expect(pick.quantity).toBe(1);
      }
    }
  });

  it("avoids the previous trio while still returning three picks", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const first = pickRewards(50_000, seed);
      const excluded = first.map((p) => p.reward.id);
      const second = pickRewards(50_000, seed + 977, excluded);
      expect(second.length).toBe(3);
      for (const pick of second) {
        expect(excluded, `seed ${seed}`).not.toContain(pick.reward.id);
      }
    }
  });

  it("still returns three picks when the exclude list is huge", () => {
    const excluded = REWARDS.slice(0, REWARDS.length - 2).map((r) => r.id);
    expect(pickRewards(60_000, 5, excluded).length).toBe(3);
  });

  it("produces a varied spread of trios across seeds", () => {
    const trios = new Set<string>();
    for (let seed = 1; seed <= 50; seed++) {
      trios.add(
        pickRewards(60_000, seed)
          .map((p) => p.reward.id)
          .join("|")
      );
    }
    expect(trios.size).toBeGreaterThanOrEqual(25);
  });

  it("degrades gracefully when only the cheapest tier is affordable", () => {
    const picks = pickRewards(50, 4);
    expect(picks.length).toBeGreaterThan(0);
    for (const pick of picks) {
      expect(pick.reward.price).toBeLessThanOrEqual(50);
    }
  });
});

describe("showsLeftover", () => {
  it("shows the remainder when the reward is the dominant spend", () => {
    expect(
      showsLeftover({ reward: REWARDS[0], quantity: 1, totalCost: 4500, leftover: 2700 })
    ).toBe(true);
  });

  it("hides a remainder that dwarfs the reward", () => {
    expect(
      showsLeftover({ reward: REWARDS[0], quantity: 25, totalCost: 300, leftover: 6900 })
    ).toBe(false);
  });

  it("hides trivial remainders", () => {
    expect(
      showsLeftover({ reward: REWARDS[0], quantity: 8, totalCost: 7192, leftover: 8 })
    ).toBe(false);
  });
});

describe("buildReel", () => {
  it("returns the requested number of rows", () => {
    expect(buildReel(8640, 1).length).toBe(REEL_ROWS);
    expect(buildReel(8640, 1, 4).length).toBe(4);
  });

  it("is deterministic per seed", () => {
    expect(buildReel(8640, 9)).toEqual(buildReel(8640, 9));
  });

  it("only shows affordable rewards when any are affordable", () => {
    for (const row of buildReel(500, 3)) {
      expect(row.price).toBeLessThanOrEqual(500);
    }
  });

  it("falls back to the full catalogue when nothing is affordable", () => {
    expect(buildReel(0, 3).length).toBe(REEL_ROWS);
  });
});
