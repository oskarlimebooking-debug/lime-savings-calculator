import React from "react";
import { getRegionOptions } from "../lib/stepHelpers";
import { RegionSlug } from "../lib/data";
import { Lang, getRegionName } from "../lib/i18n";

interface RegionPickerProps {
  value: RegionSlug;
  onChange: (value: RegionSlug) => void;
  lang: Lang;
}

export const RegionPicker: React.FC<RegionPickerProps> = ({ value, onChange, lang }) => {
  const regions = getRegionOptions();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full" id="region-picker-container">
      {regions.map((reg) => {
        const isSelected = value === reg.slug;
        return (
          <button
            key={reg.slug}
            id={`region-picker-option-${reg.slug}`}
            type="button"
            onClick={() => onChange(reg.slug)}
            className={`py-3 px-4 rounded-xl border text-center break-words hyphens-auto leading-snug transition-all duration-300 cursor-pointer font-medium text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 ${
              isSelected
                ? "border-lime-500 bg-lime-50/40 dark:bg-lime-950/20 text-lime-700 dark:text-lime-400 shadow-sm"
                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {getRegionName(reg.slug, lang)}
          </button>
        );
      })}
    </div>
  );
};
