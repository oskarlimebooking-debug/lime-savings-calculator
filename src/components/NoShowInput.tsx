import React, { useEffect, useState } from "react";
import { Period } from "../lib/calc";
import { clampNoShows, convertNoShowsPeriod, NO_SHOW_LIMITS } from "../lib/stepHelpers";
import { Lang, getTranslations } from "../lib/i18n";
import { inputClass } from "../lib/ui";

interface NoShowInputProps {
  value: number;
  period: Period;
  onChange: (value: number) => void;
  onPeriodChange: (period: Period) => void;
  lang: Lang;
}

export const NoShowInput: React.FC<NoShowInputProps> = ({
  value,
  period,
  onChange,
  onPeriodChange,
  lang,
}) => {
  const t = getTranslations(lang);
  const limits = NO_SHOW_LIMITS[period];
  const [localString, setLocalString] = useState(value.toString());

  // Synchronize local string when value or period changes externally
  useEffect(() => {
    setLocalString(value.toString());
  }, [value, period]);

  const handlePeriodToggle = (targetPeriod: Period) => {
    if (period === targetPeriod) return;
    const converted = convertNoShowsPeriod(value, period, targetPeriod);
    onPeriodChange(targetPeriod);
    onChange(converted);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    // Allow empty string temporarily so user can clear and type
    setLocalString(valStr);

    if (valStr === "") {
      onChange(0);
      return;
    }

    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      const clamped = clampNoShows(parsed, period);
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(localString, 10);
    const clamped = isNaN(parsed) ? 0 : clampNoShows(parsed, period);
    onChange(clamped);
    setLocalString(clamped.toString());
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = clampNoShows(val, period);
      onChange(clamped);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" id="noshow-input-container">
      {/* Top controls: Toggle and Numeric Input */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Weekly/Monthly Period Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t.noShowInput.periodLabel}
          </label>
          <div className="bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl flex gap-1 w-full max-w-[240px]">
            <button
              id="period-toggle-weekly"
              type="button"
              onClick={() => handlePeriodToggle("weekly")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                period === "weekly"
                  ? "bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.noShowInput.weekly}
            </button>
            <button
              id="period-toggle-monthly"
              type="button"
              onClick={() => handlePeriodToggle("monthly")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                period === "monthly"
                  ? "bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.noShowInput.monthly}
            </button>
          </div>
        </div>

        {/* Numeric Input */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label
            htmlFor="noshow-input-numeric"
            className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            {t.noShowInput.countLabel}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="noshow-input-numeric"
              type="number"
              min={limits.min}
              max={limits.max}
              value={localString}
              onChange={handleTextChange}
              onBlur={handleBlur}
              className={`${inputClass()} w-24`}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {period === "weekly" ? t.noShowInput.perWeek : t.noShowInput.perMonth}
            </span>
          </div>
        </div>
      </div>

      {/* Slider Control: 44px tarca z bg-clip-content, da ostane proga vizualno tanka. */}
      <div className="flex flex-col gap-2 w-full">
        <input
          id="noshow-input-slider"
          type="range"
          min={limits.min}
          max={limits.max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-11 py-[1.125rem] bg-clip-content bg-surface-subtle dark:bg-surface-dark-subtle rounded-pill appearance-none cursor-pointer accent-sage-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage"
        />
        <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500 px-1">
          <span>{limits.min}</span>
          <span>{limits.max}</span>
        </div>
      </div>
    </div>
  );
};
