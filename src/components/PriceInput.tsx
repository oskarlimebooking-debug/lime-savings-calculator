"use client";

import React, { useEffect, useState } from "react";

interface PriceInputProps {
  /** The effective price currently in use (custom override or region/category default). */
  value: number;
  /** The region/category-derived suggested average price. */
  defaultPrice: number;
  /** Whether `value` is a user-entered override rather than the default. */
  isCustom: boolean;
  onChange: (price: number) => void;
  onReset: () => void;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  defaultPrice,
  isCustom,
  onChange,
  onReset,
}) => {
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
          Povprečna cena termina
        </label>
        {isCustom && (
          <button
            id="price-input-reset"
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-lime-700 dark:text-lime-400 hover:underline cursor-pointer"
          >
            Ponastavi na privzeto ({defaultPrice.toFixed(2).replace(".", ",")} €)
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
            className="w-full px-3 py-2.5 pr-8 text-center font-bold text-lg border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 transition-all duration-200"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 font-medium pointer-events-none">
            €
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {isCustom
            ? "vaša cena (prilagojeno)"
            : `privzeto za vašo regijo/panogo`}
        </span>
      </div>
    </div>
  );
};
