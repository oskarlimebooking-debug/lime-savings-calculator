import React from "react";
import { formatEUR, getRoiClass, getRoiLabelMonths, FOOTNOTE_TEXT } from "../lib/calc";
import { SavingsChart } from "./SavingsChart";
import { InfoTrigger } from "./InfoModal";

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
}) => {
  const roiClass = getRoiClass(roiMonths);
  const formattedRoi = getRoiLabelMonths(roiMonths);
  const reductionPct = Math.round(noShowReduction * 100);

  return (
    <div
      id="results-panel-container"
      className="w-full bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100/40 dark:shadow-none flex flex-col gap-6 md:gap-8"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Izračun izpada in prihrankov
          </h2>
          {onInfoClick && <InfoTrigger onClick={onInfoClick} />}
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Pregled finančnih učinkov neudeležb in potenciala za izboljšanje.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Estimated Revenue Loss Panel */}
        <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/50 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Mesečni izpad prihodka
            </span>
            <span
              key={monthlyLoss}
              id="results-monthly-loss"
              className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1.5 inline-block popIn"
            >
              {formatEUR(monthlyLoss)}
            </span>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/50 w-full" />

          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Letni izpad prihodka
            </span>
            <span
              key={yearlyLoss}
              id="results-yearly-loss"
              className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1.5 inline-block popIn"
            >
              {formatEUR(yearlyLoss)}
            </span>
          </div>
        </div>

        {/* Potential Savings Panel */}
        <div className="bg-lime-50/30 dark:bg-lime-950/5 border border-lime-100/50 dark:border-lime-900/20 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-lime-700 dark:text-lime-500 uppercase tracking-wider">
              Letni prihranek z Lime Booking
            </span>
            <span
              key={yearlySaving}
              id="results-yearly-saving"
              className="text-3xl md:text-4xl font-black text-lime-600 dark:text-lime-400 mt-1.5 inline-block popIn"
            >
              {formatEUR(yearlySaving)}
            </span>
            <p className="text-xs text-lime-700/70 dark:text-lime-500/70 mt-2 font-medium">
              Ob predpostavki {reductionPct} % zmanjšanja števila neudeležb z avtomatskimi opomniki.
            </p>
          </div>
        </div>
      </div>

      {/* ROI Highlight Card */}
      <div
        id="results-roi-card"
        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          roiTier === "green"
            ? "bg-lime-50/60 border-lime-200 dark:bg-lime-950/10 dark:border-lime-900/50"
            : "bg-amber-50/60 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/50"
        } ${roiClass}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              roiTier === "green"
                ? "bg-lime-500 text-white"
                : "bg-amber-500 text-white"
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
                  ? "text-lime-800 dark:text-lime-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              Lime Booking se povrne v {formattedRoi} mesecih
            </span>
            <p
              className={`text-xs mt-0.5 font-medium ${
                roiTier === "green"
                  ? "text-lime-700/80 dark:text-lime-400/70"
                  : "text-amber-700/80 dark:text-amber-400/70"
              }`}
            >
              {roiTier === "green"
                ? "Izjemno hitra povrnitev investicije!"
                : "Povrnitev investicije na podlagi trenutnih nastavitev."}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-zinc-800/60 w-full" />

      <SavingsChart yearlyLoss={yearlyLoss} yearlySaving={yearlySaving} />

      {/* Footnote */}
      <footer
        id="results-footnote"
        className="text-[11px] leading-normal text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-zinc-800/60 pt-4"
      >
        {footnote}
      </footer>
    </div>
  );
};
