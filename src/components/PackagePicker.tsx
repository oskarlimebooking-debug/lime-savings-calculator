"use client";

import React, { useEffect, useRef, useState } from "react";
import { getPackageOptions } from "../lib/stepHelpers";
import { PackageSlug } from "../lib/data";
import { Lang, getTranslations, getPackageText } from "../lib/i18n";
import { badgeClass, cardClass, chipClass } from "../lib/ui";

interface PackagePickerProps {
  value: PackageSlug;
  onChange: (value: PackageSlug) => void;
  lang: Lang;
}

export const PackagePicker: React.FC<PackagePickerProps> = ({ value, onChange, lang }) => {
  const packages = getPackageOptions();
  const t = getTranslations(lang);
  const selected = packages.find((p) => p.slug === value) ?? packages[packages.length - 1];
  const selectedText = getPackageText(selected.slug, selected.name, selected.tagline, selected.features, lang);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative w-full" id="package-picker-container" ref={containerRef}>
      <button
        id="package-picker-trigger"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${chipClass(false)} w-full flex items-center justify-between gap-4 p-4 rounded-2xl text-left`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`p-3 rounded-xl transition-colors duration-300 flex-shrink-0 ${
              selected.notificationChannel === "sms"
                ? "bg-sage-500 text-white"
                : "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
            }`}
          >
            {selected.notificationChannel === "sms" ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base tracking-tight text-gray-800 dark:text-gray-200">
                {selectedText.name}
              </p>
              {selected.slug === "advanced" && (
                <span className={badgeClass("success")}>
                  {t.packagePicker.recommended}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {selectedText.tagline} &middot; {selected.monthlyPrice.toFixed(2).replace(".", ",")} €{t.packagePicker.perMonth}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id="package-picker-menu"
          role="listbox"
          className={`${cardClass(true)} absolute z-20 mt-2 w-full overflow-hidden popIn max-h-96 overflow-y-auto`}
        >
          {packages.map((pkg) => {
            const isSelected = pkg.slug === value;
            const text = getPackageText(pkg.slug, pkg.name, pkg.tagline, pkg.features, lang);
            return (
              <button
                key={pkg.slug}
                id={`package-picker-option-${pkg.slug}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(pkg.slug);
                  setOpen(false);
                }}
                className={`w-full flex items-start justify-between gap-4 p-4 text-left transition-colors duration-150 cursor-pointer border-b border-gray-50 dark:border-zinc-800/60 last:border-b-0 ${
                  isSelected
                    ? "bg-sage-50/60 dark:bg-sage-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex flex-col min-w-0 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{text.name}</span>
                    {pkg.slug === "advanced" && (
                      <span className={badgeClass("success")}>
                        {t.packagePicker.recommended}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {text.tagline} &middot; {t.packagePicker.reductionApprox(Math.round(pkg.noShowReduction * 100))}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {text.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {pkg.monthlyPrice.toFixed(2).replace(".", ",")} €
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-sage-600 dark:text-sage-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
