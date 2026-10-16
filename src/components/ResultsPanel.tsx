import React from "react";
import { formatEUR, getRoiClass, getRoiLabelDays, FOOTNOTE_TEXT } from "../lib/calc";
import { SavingsChart } from "./SavingsChart";
import { InfoTrigger } from "./InfoModal";
import { AutoFitAmount } from "./AutoFitAmount";
import { Lang, DEFAULT_LANG, getTranslations, LANG_LOCALE } from "../lib/i18n";

export interface ResultsPanelProps {
  monthlyLoss: number;
  yearlyLoss: number;
  yearlySaving: number;
  roiMonths: number;
  roiTier: "green" | "warning";
  footnote?: string;
  /** Percentage (0-1) of no-show reduction assumed for the currently selected package. */
  noShowReduction?: number;
  onInfoClick?: () => void;
  lang?: Lang;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  monthlyLoss,
  yearlyLoss,
  yearlySaving,
  roiMonths,
  roiTier,
  footnote = FOOTNOTE_TEXT,
  noShowReduction = 0.6,
  onInfoClick,
  lang = DEFAULT_LANG,
}) => {
  const t = getTranslations(lang);
  const locale = LANG_LOCALE[lang];
  const roiClass = getRoiClass(roiMonths);
  const formattedRoi = getRoiLabelDays(roiMonths, locale);
  const reductionPct = Math.round(noShowReduction * 100);

  return (
    <div
      id="results-panel-container"
      className="w-full bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100/40 dark:shadow-none flex flex-col gap-6 md:gap-8"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            {t.results.heading}
          </h2>
          {onInfoClick && <InfoTrigger onClick={onInfoClick} label={t.info.triggerLabel} />}
        </div>
        <p className="text-body-m text-gray-400 dark:text-gray-500">{t.results.subheading}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Estimated Revenue Loss Panel */}
        <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/50 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-caption font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t.results.monthlyLoss}
            </span>
            <div key={monthlyLoss} className="mt-1.5">
              <AutoFitAmount
                id="results-monthly-loss"
                text={formatEUR(monthlyLoss, locale)}
                className="text-body-m font-bold text-gray-800 dark:text-gray-100 popIn"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/50 w-full" />

          <div className="flex flex-col">
            <span className="text-caption font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t.results.yearlyLoss}
            </span>
            <div key={yearlyLoss} className="mt-1.5">
              <AutoFitAmount
                id="results-yearly-loss"
                text={formatEUR(yearlyLoss, locale)}
                className="text-body-m font-bold text-gray-800 dark:text-gray-100 popIn"
              />
            </div>
          </div>
        </div>

        {/* Potential Savings Panel */}
        <div className="bg-success-soft/60 dark:bg-success/5 border border-success/20 dark:border-success/20 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-caption font-bold text-success-strong dark:text-success uppercase tracking-wider">
              {t.results.yearlySaving}
            </span>
            <div key={yearlySaving} className="mt-1.5">
              <AutoFitAmount
                id="results-yearly-saving"
                text={formatEUR(yearlySaving, locale)}
                className="text-h1 text-success-strong dark:text-success popIn"
              />
            </div>
            <p className="text-caption text-success-strong/70 dark:text-success/70 mt-2 font-medium">
              {t.results.savingAssumption(reductionPct)}
            </p>
          </div>
        </div>
      </div>

      {/* ROI Highlight Card */}
      <div
        id="results-roi-card"
        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          roiTier === "green"
            ? "bg-success-soft/70 border-success/30 dark:bg-success/5 dark:border-success/30"
            : "bg-warning-soft/70 border-warning/30 dark:bg-warning/5 dark:border-warning/30"
        } ${roiClass}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              roiTier === "green"
                ? "bg-success text-white"
                : "bg-warning text-white"
            }`}
          >
            {roiTier === "green" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          <div className="flex flex-col">
            <span
              id="results-roi-label"
              className={`text-lg font-bold tracking-tight ${
                roiTier === "green"
                  ? "text-success-strong dark:text-success"
                  : "text-warning-strong dark:text-warning"
              }`}
            >
              {t.results.roiLabel(formattedRoi)}
            </span>
            <p
              className={`text-caption mt-0.5 font-medium ${
                roiTier === "green"
                  ? "text-success-strong/80 dark:text-success/80"
                  : "text-warning-strong/80 dark:text-warning/80"
              }`}
            >
              {roiTier === "green" ? t.results.roiGreen : t.results.roiWarning}
            </p>

            {roiTier === "warning" && (
              <div
                id="results-value-add"
                className="flex items-start gap-2 mt-3 pt-3 border-t border-warning/30 dark:border-warning/30"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning-strong dark:text-warning"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-caption font-bold text-warning-strong dark:text-warning">
                    {t.results.valueAddHeading}
                  </span>
                  <p className="text-caption text-warning-strong/80 dark:text-warning/80 mt-0.5">
                    {t.results.valueAddText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-zinc-800/60 w-full" />

      <SavingsChart yearlyLoss={yearlyLoss} yearlySaving={yearlySaving} lang={lang} />

      {/* Footnote */}
      <footer
        id="results-footnote"
        className="text-caption text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-zinc-800/60 pt-4"
      >
        {footnote}
      </footer>
    </div>
  );
};
