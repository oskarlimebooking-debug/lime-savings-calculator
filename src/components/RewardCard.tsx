import React from "react";
import { formatEUR } from "../lib/calc";
import { Reward } from "../lib/rewards";
import { RewardPick, showsLeftover } from "../lib/rewardPicker";
import { Lang, DEFAULT_LANG, getTranslations, LANG_LOCALE } from "../lib/i18n";

export interface RewardCardProps {
  index: number;
  pick: RewardPick;
  /** Decoy rewards shown on the spinning strip. */
  reel: readonly Reward[];
  spinning: boolean;
  lang?: Lang;
  onSelect?: (pick: RewardPick) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  index,
  pick,
  reel,
  spinning,
  lang = DEFAULT_LANG,
  onSelect,
}) => {
  const t = getTranslations(lang);
  const locale = LANG_LOCALE[lang];
  const { reward, quantity, totalCost, leftover } = pick;

  if (spinning) {
    // Rows are 6rem in a 9rem window, so 1.5 rows show at a time — the reel reads
    // as a strip in motion rather than a card swapping content. The keyframe
    // translates by 8 rows, so two duplicate rows at the end make the loop seamless.
    const rows = reel.length > 0 ? [...reel, reel[0], reel[1] ?? reel[0]] : [];
    return (
      <div
        id={`reward-card-${index}`}
        className="relative h-36 overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-800/30"
      >
        <div
          className="reelSpin"
          aria-hidden="true"
          // Staggered durations stop the three reels from moving in lockstep.
          style={{ animationDuration: `${0.45 + index * 0.09}s` }}
        >
          {rows.map((row, i) => (
            <div
              key={`${row.id}-${i}`}
              className="h-24 flex items-center justify-center gap-3 px-4"
            >
              <span className="text-3xl leading-none">{row.emoji}</span>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">
                {row.label[lang]}
              </span>
            </div>
          ))}
        </div>
        {/* Slot-machine vignette: soft fade at the top and bottom edges only. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-gray-50 dark:from-zinc-900 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-gray-50 dark:from-zinc-900 to-transparent"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <a
      id={`reward-card-${index}`}
      href={reward.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onSelect?.(pick)}
      className="rewardSettle group flex flex-col gap-2 h-full min-h-36 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50/40 dark:bg-zinc-800/20 transition-all hover:border-sage-200 dark:hover:border-sage-900/50 hover:bg-sage-50/30 dark:hover:bg-sage-950/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage"
    >
      <span className="text-3xl leading-none" aria-hidden="true">
        {reward.emoji}
      </span>

      <span className="text-base font-bold text-gray-800 dark:text-gray-100 leading-snug">
        {t.rewards.quantity(quantity, reward.label[lang])}
      </span>

      {showsLeftover(pick) && (
        <span className="text-xs font-medium text-sage-700/80 dark:text-sage-500/70">
          {t.rewards.leftover(formatEUR(leftover, locale))}
        </span>
      )}

      <span className="mt-auto pt-2 text-[11px] text-gray-400 dark:text-gray-500 group-hover:text-sage-700 dark:group-hover:text-sage-400 transition-colors">
        {t.rewards.at(reward.retailer, formatEUR(totalCost, locale))}
      </span>

      <span className="sr-only">{t.rewards.newTab}</span>
    </a>
  );
};
