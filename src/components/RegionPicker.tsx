import React from "react";
import { getRegionOptions } from "../lib/stepHelpers";
import { RegionSlug } from "../lib/data";
import { Lang, getRegionName } from "../lib/i18n";
import { chipClass } from "../lib/ui";

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
            className={`${chipClass(isSelected)} py-3 px-4 rounded-xl text-center break-words hyphens-auto leading-snug font-medium text-sm`}
          >
            {getRegionName(reg.slug, lang)}
          </button>
        );
      })}
    </div>
  );
};
