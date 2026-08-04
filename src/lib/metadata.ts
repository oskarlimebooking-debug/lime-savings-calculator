import { UrlState } from "./urlState";
import { CATEGORIES, REGIONS, getPrice } from "./data";
import { calculateSavings } from "./calc";

/**
 * Generates the SEO metadata object for Next.js based on the calculator state.
 */
export function buildMetadata(state: UrlState) {
  const categoryObj = CATEGORIES.find((c) => c.slug === state.category);
  const regionObj = REGIONS.find((r) => r.slug === state.region);

  const categoryName = categoryObj ? categoryObj.name : state.category;
  const regionName = regionObj ? regionObj.name : state.region;

  const price = state.customPrice ?? getPrice(state.category, state.region);
  const savings = calculateSavings(state.noshows, state.period, price, state.pkg);
  const yearlyLoss = savings.yearlyLoss;

  // Format the yearly loss with dot separator for thousands (Slovenian style)
  const roundedLoss = Math.round(yearlyLoss);
  const formattedLoss = roundedLoss.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const title = `${categoryName} v ${regionName}: letna izguba €${formattedLoss} | Lime Savings Calculator`;
  const description = `Letna izguba za ${categoryName} v regiji ${regionName} zaradi no-shows je €${formattedLoss}. Preprečite izpad in prihranite z Lime Booking!`;

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
          alt: `${categoryName} v ${regionName} letna izguba`,
        },
      ],
    },
  };
}
