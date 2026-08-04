import React from "react";
import { getCategoryOptions } from "../lib/stepHelpers";
import { CategorySlug } from "../lib/data";
import { Lang, getCategoryName } from "../lib/i18n";

interface CategoryPickerProps {
  value: CategorySlug;
  onChange: (value: CategorySlug) => void;
  lang: Lang;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({ value, onChange, lang }) => {
  const categories = getCategoryOptions();

  // Custom premium SVG icons for each category
  const renderIcon = (slug: CategorySlug) => {
    switch (slug) {
      case "frizerstvo":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="9" y1="8.5" x2="20" y2="18.5" />
            <line x1="9" y1="15.5" x2="20" y2="5.5" />
          </svg>
        );
      case "brivstvo":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v4H4V4zm0 4v12M8 8v8M12 8v12M16 8v8M20 8v12" />
          </svg>
        );
      case "kozmeticni-saloni":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 21l-.813-5.096L3.096 15 8.187 14.187 9 9l.813 5.187L14.904 15l-5.091.904zM19.006 5.006L18.5 8l-.506-2.994L15 4.5l2.994-.506L18.5 1l.506 2.994L22 4.5l-2.994.506zM17.006 17.006L16.5 20l-.506-2.994L13 16.5l2.994-.506L16.5 13l.506 2.994L20 16.5l-2.994.506z"
            />
          </svg>
        );
      case "druge-lepotne-storitve":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zm0 14a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zm-7-7a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zm14 0a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" id="category-picker-container">
      {categories.map((cat) => {
        const isSelected = value === cat.slug;
        return (
          <button
            key={cat.slug}
            id={`category-picker-option-${cat.slug}`}
            type="button"
            onClick={() => onChange(cat.slug)}
            className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-500/50 ${
              isSelected
                ? "border-lime-500 bg-lime-50/40 dark:bg-lime-950/20 text-lime-700 dark:text-lime-400 shadow-sm shadow-lime-100/50 dark:shadow-none"
                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <div
              className={`p-3 rounded-xl transition-colors duration-300 ${
                isSelected
                  ? "bg-lime-500 text-white"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-100"
              }`}
            >
              {renderIcon(cat.slug)}
            </div>
            <div>
              <p className="font-semibold text-base tracking-tight">{getCategoryName(cat.slug, lang)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
