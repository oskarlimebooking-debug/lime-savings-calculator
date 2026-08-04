"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lang, LANGUAGES, getTranslations } from "../lib/i18n";

interface LanguagePickerProps {
  value: Lang;
  onChange: (lang: Lang) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({ value, onChange }) => {
  const t = getTranslations(value);
  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];
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
    <div className="relative" id="language-picker-container" ref={containerRef}>
      <button
        id="language-picker-trigger"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.languagePicker.label}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-500/50"
      >
        <span aria-hidden="true">{selected.flag}</span>
        <span>{selected.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          id="language-picker-menu"
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden popIn"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === value;
            return (
              <button
                key={lang.code}
                id={`language-picker-option-${lang.code}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-lime-50/60 dark:bg-lime-950/20 text-lime-700 dark:text-lime-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span aria-hidden="true">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
