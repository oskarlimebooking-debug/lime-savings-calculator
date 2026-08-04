"use client";

import React from "react";
import { ADDONS, AddonSlug, AddonQuantities, calculateAddonsTotal } from "../lib/data";
import { Lang, getTranslations, getAddonName, LANG_LOCALE } from "../lib/i18n";
import { formatEUR } from "../lib/calc";

interface AddonsPickerProps {
  quantities: AddonQuantities;
  onChange: (slug: AddonSlug, qty: number) => void;
  lang: Lang;
  /** The selected package's base monthly price (excl. add-ons), in EUR. */
  basePrice: number;
  packageName: string;
}

const MAX_QTY = 50;

export const AddonsPicker: React.FC<AddonsPickerProps> = ({
  quantities,
  onChange,
  lang,
  basePrice,
  packageName,
}) => {
  const t = getTranslations(lang);
  const locale = LANG_LOCALE[lang];
  const addonsTotal = calculateAddonsTotal(quantities);
  const totalPrice = basePrice + addonsTotal;

  return (
    <div className="w-full flex flex-col gap-4" id="addons-picker-container">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t.addons.description}</p>
      <div className="flex flex-col gap-3">
        {ADDONS.map((addon) => {
          const qty = quantities[addon.slug] ?? 0;
          return (
            <div
              key={addon.slug}
              id={`addon-row-${addon.slug}`}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {getAddonName(addon.slug, addon.name, lang)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {addon.unitPrice.toFixed(2).replace(".", ",")} {t.addons.perMonth}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  id={`addon-decrement-${addon.slug}`}
                  type="button"
                  onClick={() => onChange(addon.slug, Math.max(qty - 1, 0))}
                  disabled={qty <= 0}
                  aria-label={`-1 ${getAddonName(addon.slug, addon.name, lang)}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span id={`addon-qty-${addon.slug}`} className="w-6 text-center font-bold text-sm text-gray-800 dark:text-gray-100">
                  {qty}
                </span>
                <button
                  id={`addon-increment-${addon.slug}`}
                  type="button"
                  onClick={() => onChange(addon.slug, Math.min(qty + 1, MAX_QTY))}
                  disabled={qty >= MAX_QTY}
                  aria-label={`+1 ${getAddonName(addon.slug, addon.name, lang)}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        id="addons-total-summary"
        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-100 dark:border-lime-900/30"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.addons.totalLabel}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {t.addons.baseLabel(packageName)}
            {addonsTotal > 0 && ` + ${formatEUR(addonsTotal, locale)}`}
          </span>
        </div>
        <span
          id="addons-total-price"
          className="text-lg font-black text-lime-600 dark:text-lime-400 flex-shrink-0"
        >
          {formatEUR(totalPrice, locale)}
          {t.packagePicker.perMonth}
        </span>
      </div>
    </div>
  );
};
