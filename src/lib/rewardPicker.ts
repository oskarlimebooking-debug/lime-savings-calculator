import {
  Reward,
  RewardTier,
  REWARDS,
  TIER_ORDER,
  CHEAPEST_REWARD_PRICE,
} from "./rewards";

/** Above this the multiplier stops feeling impressive and starts feeling silly. */
export const MAX_QUANTITY = 25;
/** Quantities at or below this read best on a card. */
export const SWEET_MAX = 12;
/** Leftover below this is noise — the card hides the remainder line. */
export const LEFTOVER_MIN = 30;
/**
 * Seed used for the very first (server and hydration) render. Fixed on purpose:
 * server HTML and the first client render must be byte-identical.
 */
export const INITIAL_REWARD_SEED = 1;
/** How many decoy rows the spinning reel shows. */
export const REEL_ROWS = 8;

export interface RewardPick {
  reward: Reward;
  /** Always >= 1. Forced to 1 for `singleOnly` rewards. */
  quantity: number;
  totalCost: number;
  /** Budget minus totalCost. Always >= 0. */
  leftover: number;
}

/**
 * mulberry32 PRNG. Chosen over xorshift32 because seed 0 is not degenerate and
 * 32-bit `Math.imul` arithmetic is bit-identical on Node and in every browser —
 * a hard requirement for SSR/client agreement.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Quantity the budget affords, capped so the multiplier stays believable. */
function quantityFor(reward: Reward, budget: number): number {
  if (reward.singleOnly) return 1;
  return Math.min(Math.floor(budget / reward.price), MAX_QUANTITY);
}

/**
 * How keen we are to show this reward at this budget. The 0.12 tail is what
 * stops "1.842× kava" from dominating every large-budget trio.
 */
function weightFor(reward: Reward, budget: number): number {
  const q = reward.singleOnly ? 1 : Math.floor(budget / reward.price);
  if (q <= 0) return 0;
  if (q <= SWEET_MAX) return 1;
  if (q <= MAX_QUANTITY) return 0.4;
  return 0.12;
}

/** Weighted sample without replacement. Returns undefined for an empty pool. */
function sampleWeighted(pool: readonly Reward[], budget: number, rng: () => number): Reward | undefined {
  if (pool.length === 0) return undefined;
  let total = 0;
  for (const r of pool) total += weightFor(r, budget);
  if (total <= 0) return pool[Math.floor(rng() * pool.length)];

  let target = rng() * total;
  for (const r of pool) {
    target -= weightFor(r, budget);
    if (target <= 0) return r;
  }
  return pool[pool.length - 1];
}

function pickFrom<T>(items: readonly T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

/**
 * The remainder line only reads well when the reward is the dominant spend.
 * "a week in the Maldives … plus 2.700 € left over" lands; "25× coffee … plus
 * 559.293 € left over" just makes the reward look trivial.
 */
export function showsLeftover(pick: RewardPick): boolean {
  return pick.leftover >= LEFTOVER_MIN && pick.totalCost >= pick.leftover;
}

function toPick(reward: Reward, budget: number): RewardPick {
  const quantity = Math.max(1, quantityFor(reward, budget));
  const totalCost = quantity * reward.price;
  return { reward, quantity, totalCost, leftover: budget - totalCost };
}

/**
 * Splits the affordable tiers into three ascending contiguous slices, so every
 * trio spans a small, a mid and a big-ticket item. With six tiers that gives
 * [treat,small] [mid,big] [grand,dream]; randomising within each slice means
 * consecutive shuffles can serve treat/mid/dream then small/big/grand.
 */
function sliceTiers(tiers: readonly RewardTier[]): RewardTier[][] {
  const n = tiers.length;
  const k = Math.max(1, Math.floor(n / 3));
  return [tiers.slice(0, k), tiers.slice(k, n - k), tiers.slice(n - k)];
}

/**
 * Picks exactly three affordable rewards (fewer only when the catalogue cannot
 * offer three), deterministic for a given `(yearlySaving, seed, excludeIds)`.
 *
 * Deliberately takes no `Lang`: labels resolve at render time, so switching
 * language does not reshuffle the trio.
 */
export function pickRewards(
  yearlySaving: number,
  seed: number,
  excludeIds: readonly string[] = []
): RewardPick[] {
  if (!Number.isFinite(yearlySaving)) return [];
  const budget = Math.floor(yearlySaving);
  if (budget < CHEAPEST_REWARD_PRICE) return [];

  const affordable = REWARDS.filter((r) => r.price <= budget);
  if (affordable.length === 0) return [];
  if (affordable.length <= 3) {
    return [...affordable].sort((a, b) => a.price - b.price).map((r) => toPick(r, budget));
  }

  const rng = mulberry32(seed);
  const excluded = new Set(excludeIds);

  const byTier = new Map<RewardTier, Reward[]>();
  for (const r of affordable) {
    const bucket = byTier.get(r.tier);
    if (bucket) bucket.push(r);
    else byTier.set(r.tier, [r]);
  }
  const tiers = TIER_ORDER.filter((t) => (byTier.get(t)?.length ?? 0) > 0);

  const chosen: Reward[] = [];
  const taken = new Set<string>();

  const take = (pool: readonly Reward[]): void => {
    // Prefer unseen items; fall back to the unfiltered bucket rather than
    // returning fewer than three cards.
    const fresh = pool.filter((r) => !taken.has(r.id) && !excluded.has(r.id));
    const usable = fresh.length > 0 ? fresh : pool.filter((r) => !taken.has(r.id));
    const reward = sampleWeighted(usable, budget, rng);
    if (reward) {
      chosen.push(reward);
      taken.add(reward.id);
    }
  };

  if (tiers.length === 1) {
    // Only one tier is affordable — variety has to come from the price spread.
    const pool = byTier.get(tiers[0]) ?? [];
    for (let i = 0; i < 3; i++) take(pool);
  } else if (tiers.length === 2) {
    take(byTier.get(tiers[0]) ?? []);
    take(byTier.get(tiers[1]) ?? []);
    const remaining = tiers
      .map((t) => (byTier.get(t) ?? []).filter((r) => !taken.has(r.id)))
      .sort((a, b) => b.length - a.length);
    take(remaining[0] ?? []);
  } else {
    for (const slice of sliceTiers(tiers)) {
      const tier = pickFrom(slice, rng) ?? tiers[0];
      take(byTier.get(tier) ?? []);
    }
  }

  // Backfill if a bucket came up empty (possible only with a tiny catalogue).
  if (chosen.length < 3) {
    const rest = affordable.filter((r) => !taken.has(r.id));
    while (chosen.length < 3 && rest.length > 0) {
      const reward = sampleWeighted(rest, budget, rng);
      if (!reward) break;
      chosen.push(reward);
      taken.add(reward.id);
      rest.splice(rest.indexOf(reward), 1);
    }
  }

  return chosen
    .sort((a, b) => a.price - b.price)
    .map((r) => toPick(r, budget));
}

/**
 * Deterministic decoy rewards for the spinning reel. Called with the same seed
 * as the visible trio so server and client agree on the strip contents.
 */
export function buildReel(
  yearlySaving: number,
  seed: number,
  rows: number = REEL_ROWS
): Reward[] {
  const budget = Number.isFinite(yearlySaving) ? Math.floor(yearlySaving) : 0;
  const affordable = REWARDS.filter((r) => r.price <= budget);
  const pool = affordable.length > 0 ? affordable : REWARDS;
  const rng = mulberry32(seed ^ 0x9e3779b9);
  return Array.from({ length: rows }, () => pool[Math.floor(rng() * pool.length)]);
}
