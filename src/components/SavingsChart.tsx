import React from "react";
import { formatEUR } from "../lib/calc";
import { AutoFitAmount } from "./AutoFitAmount";
import { Lang, DEFAULT_LANG, getTranslations, LANG_LOCALE } from "../lib/i18n";
import { chartSeriesColor } from "../lib/ui";

export interface SavingsChartProps {
  yearlyLoss: number;
  yearlySaving: number;
  lang?: Lang;
}

export const SavingsChart: React.FC<SavingsChartProps> = ({ yearlyLoss, yearlySaving, lang = DEFAULT_LANG }) => {
  const t = getTranslations(lang);
  const locale = LANG_LOCALE[lang];
  const hasData = yearlyLoss > 0;
  const remainingLoss = Math.max(yearlyLoss - yearlySaving, 0);
  const remainingPct = hasData ? (remainingLoss / yearlyLoss) * 100 : 0;
  const savingPct = hasData ? (yearlySaving / yearlyLoss) * 100 : 0;

  return (
    <div id="savings-chart-container" className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label text-ink dark:text-ink-dark uppercase">
          {t.chart.heading}
        </h3>
      </div>

      {!hasData ? (
        <p className="text-body-m text-ink-muted dark:text-ink-dark-muted py-4">{t.chart.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Bar 1: without Lime Booking */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-subtitle text-ink-muted dark:text-ink-dark-muted">
              <span className="flex-shrink-0">{t.chart.withoutLime}</span>
              <div className="min-w-0 flex-1 text-right">
                <AutoFitAmount
                  id="savings-chart-loss-label"
                  text={formatEUR(yearlyLoss, locale)}
                  className="text-ink dark:text-ink-dark font-semibold text-body-m"
                />
              </div>
            </div>
            <div className="w-full h-4 rounded-pill bg-surface-subtle dark:bg-surface-dark-subtle overflow-hidden">
              <div
                className="h-full rounded-pill transition-all duration-700 ease-out"
                style={{ width: "100%", backgroundColor: chartSeriesColor("loss") }}
                role="img"
                aria-label={`${t.chart.withoutLime}: ${formatEUR(yearlyLoss, locale)}`}
              />
            </div>
          </div>

          {/* Bar 2: with Lime Booking (stacked: remaining loss + saving) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-subtitle text-ink-muted dark:text-ink-dark-muted">
              <span className="flex-shrink-0">{t.chart.withLime}</span>
              <div className="min-w-0 flex-1 text-right">
                <AutoFitAmount
                  id="savings-chart-remaining-label"
                  text={`${formatEUR(remainingLoss, locale)} ${t.chart.lossSuffix}`}
                  className="text-ink dark:text-ink-dark font-semibold text-body-m"
                />
              </div>
            </div>
            <div className="w-full h-4 rounded-pill bg-surface-subtle dark:bg-surface-dark-subtle overflow-hidden flex">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{ width: `${remainingPct}%`, backgroundColor: chartSeriesColor("loss") }}
                role="img"
                aria-label={`${t.chart.withLime}: ${formatEUR(remainingLoss, locale)}`}
              />
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{ width: `${savingPct}%`, backgroundColor: chartSeriesColor("saving") }}
                role="img"
                aria-label={`${t.chart.legendSaving(Math.round(savingPct))}: ${formatEUR(yearlySaving, locale)}`}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 pt-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-pill flex-shrink-0"
                style={{ backgroundColor: chartSeriesColor("loss") }}
              />
              <span className="text-caption text-ink-muted dark:text-ink-dark-muted">{t.chart.legendLoss}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-pill flex-shrink-0"
                style={{ backgroundColor: chartSeriesColor("saving") }}
              />
              <span className="text-caption text-ink-muted dark:text-ink-dark-muted">
                {t.chart.legendSaving(Math.round(savingPct))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
