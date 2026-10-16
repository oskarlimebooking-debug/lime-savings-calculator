"use client";

import React, { useEffect, useState } from "react";
import { Lang, getTranslations, LANG_LOCALE } from "../lib/i18n";
import { formatEUR } from "../lib/calc";
import { buttonClass, inputClass } from "../lib/ui";

interface PriceInputProps {
  /** The effective price currently in use (custom override or region/category default). */
  value: number;
  /** The region/category-derived suggested average price. */
  defaultPrice: number;
  /** Whether `value` is a user-entered override rather than the default. */
  isCustom: boolean;
  onChange: (price: number) => void;
  onReset: () => void;
  lang: Lang;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  defaultPrice,
  isCustom,
  onChange,
  onReset,
  lang,
}) => {
  const t = getTranslations(lang);
  const [localString, setLocalString] = useState(value.toString());

  useEffect(() => {
    setLocalString(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setLocalString(valStr);

    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(localString);
    if (isNaN(parsed) || parsed <= 0) {
      setLocalString(value.toString());
      return;
    }
    const rounded = Math.round(parsed * 100) / 100;
    onChange(rounded);
    setLocalString(rounded.toString());
  };

  return (
    <div className="flex flex-col gap-2 w-full" id="price-input-container">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="price-input-numeric"
          className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {t.priceInput.label}
        </label>
        {isCustom && (
          <button
            id="price-input-reset"
            type="button"
            onClick={onReset}
            className={`${buttonClass("ghost", "sm")} !px-0 !py-0 !text-xs text-sage-700 dark:text-sage-400 hover:underline`}
          >
            {t.priceInput.reset(formatEUR(defaultPrice, LANG_LOCALE[lang]))}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-32">
          <input
            id="price-input-numeric"
            type="number"
            min={1}
            step="0.5"
            value={localString}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass()} w-full pr-8`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 font-medium pointer-events-none">
            €
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {isCustom ? t.priceInput.custom : t.priceInput.default}
        </span>
      </div>
    </div>
  );
};
