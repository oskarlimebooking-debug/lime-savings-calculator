/**
 * The reduction rate of no-shows when using Lime Booking.
 * Based on industry studies indicating digital booking systems reduce no-shows by up to 70%.
 * Source: Journal of Service Management, 2022 (general industry benchmark for digital bookings).
 */
export const NOSHOW_REDUCTION = 0.6;

/**
 * The monthly subscription price for the basic Lime Booking package (in EUR).
 * Source: Official pricing page of limebooking.si (lowest full price package for solo/micro salons is €14.90/month without VAT).
 */
export const LIME_MONTHLY_PRICE = 14.90;

export interface Category {
  slug: string;
  name: string;
}

export interface Region {
  slug: string;
  name: string;
}

export const CATEGORIES: readonly Category[] = [
  { slug: "frizerstvo", name: "Frizerstvo" },
  { slug: "brivstvo", name: "Brivstvo" },
  { slug: "kozmeticni-saloni", name: "Kozmetični saloni" },
  { slug: "druge-lepotne-storitve", name: "Druge lepotne storitve" },
] as const;

export const REGIONS: readonly Region[] = [
  { slug: "osrednjeslovenska", name: "Osrednjeslovenska" },
  { slug: "celjska", name: "Celjska" },
  { slug: "maribor", name: "Maribor" },
  { slug: "primorska", name: "Primorska" },
  { slug: "gorenjska", name: "Gorenjska" },
  { slug: "ostalo", name: "Ostalo" },
  { slug: "hr", name: "Hrvaška" },
  { slug: "rs", name: "Srbija" },
] as const;

export type CategorySlug = typeof CATEGORIES[number]["slug"];
export type RegionSlug = typeof REGIONS[number]["slug"];

// Approximate average price (in EUR) per category x region
export const PRICES: Record<CategorySlug, Record<RegionSlug, number>> = {
  frizerstvo: {
    osrednjeslovenska: 45,
    celjska: 35,
    maribor: 38,
    primorska: 38,
    gorenjska: 40,
    ostalo: 30,
    hr: 35,
    rs: 25,
  },
  brivstvo: {
    osrednjeslovenska: 25,
    celjska: 20,
    maribor: 22,
    primorska: 22,
    gorenjska: 23,
    ostalo: 18,
    hr: 20,
    rs: 15,
  },
  "kozmeticni-saloni": {
    osrednjeslovenska: 50,
    celjska: 40,
    maribor: 42,
    primorska: 42,
    gorenjska: 45,
    ostalo: 35,
    hr: 40,
    rs: 30,
  },
  "druge-lepotne-storitve": {
    osrednjeslovenska: 40,
    celjska: 30,
    maribor: 32,
    primorska: 32,
    gorenjska: 35,
    ostalo: 28,
    hr: 30,
    rs: 22,
  },
};

/**
 * Returns the average price for a given category and region.
 * Throws an error if the category or region is invalid/unknown.
 *
 * @param category - The slug of the category.
 * @param region - The slug of the region.
 * @returns The average price as a positive finite number.
 * @throws {Error} if category or region is invalid.
 */
export function getPrice(category: string, region: string): number {
  const categoryPrices = PRICES[category as CategorySlug];
  if (!categoryPrices) {
    throw new Error(`Neznana panoga/kategorija: ${category}`);
  }
  const price = categoryPrices[region as RegionSlug];
  if (price === undefined) {
    throw new Error(`Neznana regija: ${region} za panogo: ${category}`);
  }
  return price;
}
