"use client";

import React, { useState, useRef, useEffect } from "react";
import { formatEUR } from "../lib/calc";
import { pickRewards, buildReel, RewardPick, INITIAL_REWARD_SEED } from "../lib/rewardPicker";
import { RewardCard } from "./RewardCard";
import { track } from "../lib/analytics";
import { Lang, DEFAULT_LANG, getTranslations, LANG_LOCALE } from "../lib/i18n";

/**
 * When each card stops spinning, in ms. Staggered so every reveal reads as its
 * own beat; the last card lands at 4,6 s.
 */
const SETTLE_MS = [3200, 3900, 4600] as const;

export interface RewardsSectionProps {
  yearlySaving: number;
  lang?: Lang;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({
  yearlySaving,
  lang = DEFAULT_LANG,
}) => {
  const t = getTranslations(lang);
  const locale = LANG_LOCALE[lang];

  // Fixed initial seed: server HTML and the first client render must match.
  // Math.random() is only ever called inside handleShuffle.
  const [seed, setSeed] = useState<number>(INITIAL_REWARD_SEED);
  const [settledCount, setSettledCount] = useState(3); // 3 = everything revealed

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Kept in a ref, not state: it is read only inside the click handler, so it
  // cannot influence rendered output and cannot cause a hydration mismatch.
  const reducedMotionRef = useRef(false);
  const prevIdsRef = useRef<string[]>([]);

  const picks = pickRewards(yearlySaving, seed, prevIdsRef.current);
  // One reel per card, offset by index, so the three strips never show the same
  // row at the same moment.
  const reels = [0, 1, 2].map((i) => buildReel(yearlySaving, seed + i * 1013));
  const isSpinning = settledCount < picks.length;

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const timers = timersRef;
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const handleShuffle = () => {
    if (isSpinning) return; // aria-disabled, not disabled — see the button below
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Record the current trio before re-seeding so the next pick avoids it.
    prevIdsRef.current = picks.map((p) => p.reward.id);
    track("reward_shuffle", { saving: Math.floor(yearlySaving) });

    // XOR-mixing the previous seed guarantees a different trio in practice.
    setSeed((s) => (Math.floor(Math.random() * 0x7fffffff) ^ (s * 2654435761)) >>> 0);

    if (reducedMotionRef.current) {
      setSettledCount(3);
      return;
    }

    setSettledCount(0);
    SETTLE_MS.forEach((ms, i) => {
      timersRef.current.push(setTimeout(() => setSettledCount(i + 1), ms));
    });
  };

  const handleSelect = (pick: RewardPick) => {
    track("reward_click", {
      reward_id: pick.reward.id,
      tier: pick.reward.tier,
      category: pick.reward.category,
      retailer: pick.reward.retailer,
      quantity: pick.quantity,
    });
  };

  const isEmpty = picks.length === 0;

  return (
    <section
      id="rewards-section"
      aria-labelledby="rewards-heading"
      className="w-full mt-12 md:mt-16 bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <h2
          id="rewards-heading"
          className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight"
        >
          {t.rewards.heading}
        </h2>
        {!isEmpty && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t.rewards.subheading(formatEUR(yearlySaving, locale))}
          </p>
        )}
      </div>

      {isEmpty ? (
        <p id="rewards-empty" className="text-sm text-gray-500 dark:text-gray-400">
          {t.rewards.empty}
        </p>
      ) : (
        <>
          <div
            id="rewards-list"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {picks.map((pick, i) => (
              <RewardCard
                key={`${seed}-${pick.reward.id}`}
                index={i}
                pick={pick}
                reel={reels[i] ?? reels[0]}
                spinning={i >= settledCount}
                lang={lang}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              id="rewards-shuffle-button"
              type="button"
              onClick={handleShuffle}
              // aria-disabled rather than disabled: browsers blur a disabled
              // element, so `disabled` would throw keyboard focus to <body> the
              // moment the reels start. The handler guards the click instead.
              aria-disabled={isSpinning}
              aria-busy={isSpinning}
              aria-controls="rewards-list"
              aria-label={t.rewards.shuffleAria}
              className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-lime-600 dark:bg-lime-500 text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50 shadow-md shadow-lime-600/10 ${
                isSpinning
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-lime-700 dark:hover:bg-lime-600 active:scale-98"
              }`}
            >
              <svg
                className={isSpinning ? "w-5 h-5 animate-spin" : "w-5 h-5"}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 5.6 5.6M4 15a8 8 0 0 0 14.4 3.4"
                />
              </svg>
              {isSpinning ? t.rewards.shuffling : t.rewards.shuffle}
            </button>
          </div>
        </>
      )}

      <footer
        id="rewards-disclaimer"
        className="text-[11px] leading-normal text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-zinc-800/60 pt-4"
      >
        {t.rewards.disclaimer}
      </footer>
    </section>
  );
};
