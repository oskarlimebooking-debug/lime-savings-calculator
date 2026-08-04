"use client";

import React, { useEffect, useRef, useState } from "react";
import { getPackageOptions } from "../lib/stepHelpers";
import { PackageSlug } from "../lib/data";

interface PackagePickerProps {
  value: PackageSlug;
  onChange: (value: PackageSlug) => void;
}

export const PackagePicker: React.FC<PackagePickerProps> = ({ value, onChange }) => {
  const packages = getPackageOptions();
  const selected = packages.find((p) => p.slug === value) ?? packages[packages.length - 1];
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
        className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-left transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl transition-colors duration-300 ${
              selected.notificationChannel === "sms"
                ? "bg-lime-500 text-white"
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base tracking-tight text-gray-800 dark:text-gray-200">
                {selected.name}
              </p>
              {selected.slug === "advanced" && (
                <span className="px-2 py-0.5 rounded-full bg-lime-100 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 text-[10px] font-bold uppercase tracking-wider">
                  Priporočeno
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selected.tagline} &middot; {selected.monthlyPrice.toFixed(2).replace(".", ",")} €/mesec
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
          className="absolute z-20 mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden popIn"
        >
          {packages.map((pkg) => {
            const isSelected = pkg.slug === value;
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
                className={`w-full flex items-center justify-between gap-4 p-4 text-left transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-lime-50/60 dark:bg-lime-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{pkg.name}</span>
                    {pkg.slug === "advanced" && (
                      <span className="px-2 py-0.5 rounded-full bg-lime-100 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 text-[10px] font-bold uppercase tracking-wider">
                        Priporočeno
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {pkg.tagline} &middot; zmanjšanje neudeležb ~{Math.round(pkg.noShowReduction * 100)} %
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {pkg.monthlyPrice.toFixed(2).replace(".", ",")} €
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
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
