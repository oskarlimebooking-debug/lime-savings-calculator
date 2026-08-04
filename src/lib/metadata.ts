import { UrlState } from "./urlState";
import { getPrice } from "./data";
import { calculateSavings } from "./calc";
import { getCategoryName, getRegionName, getTranslations, LANG_LOCALE, DEFAULT_LANG } from "./i18n";

/**
 * Generates the SEO metadata object for Next.js based on the calculator state.
 */
export function buildMetadata(state: UrlState) {
  const lang = state.lang ?? DEFAULT_LANG;
  const t = getTranslations(lang);
  const categoryName = getCategoryName(state.category, lang);
  const regionName = getRegionName(state.region, lang);

  const price = state.customPrice ?? getPrice(state.category, state.region);
  const savings = calculateSavings(state.noshows, state.period, price, state.pkg, {
    extraUsers: state.extraUsers,
    extraLocations: state.extraLocations,
    extraResources: state.extraResources,
  });
  const yearlyLoss = savings.yearlyLoss;

  const roundedLoss = Math.round(yearlyLoss);
  const formattedLoss = new Intl.NumberFormat(LANG_LOCALE[lang], { useGrouping: true }).format(roundedLoss);

  const title = t.meta.title(categoryName, regionName, formattedLoss);
  const description = t.meta.description(categoryName, regionName, formattedLoss);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "https://lime-booking.com/og-image.png",
          width: 1200,
          height: 630,
          alt: t.meta.imageAlt(categoryName, regionName),
        },
      ],
    },
  };
}
