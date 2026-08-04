/**
 * The official Lime Booking URL.
 */
export const LIME_BOOKING_URL = "https://lime-booking.com";

export interface Package {
  slug: "basic" | "advanced";
  name: string;
  /** Monthly subscription price in EUR, billed monthly, excl. VAT. */
  monthlyPrice: number;
  /** Estimated no-show reduction rate achieved with this package's reminder channel. */
  noShowReduction: number;
  notificationChannel: "email" | "sms";
  /** Included SMS reminders per month, or null for email-only packages. */
  smsCount: number | null;
  tagline: string;
}

/**
 * Lime Booking subscription packages and their estimated no-show reduction rates.
 * Prices and feature sets sourced from the official pricing page (lime-booking.com/pricing).
 *
 * Reduction rates are differentiated by reminder channel, based on reminder-effectiveness
 * research:
 * - Basic sends e-mail-only reminders. Systematic reviews of automated (non-SMS) appointment
 *   reminder interventions report no-show reductions of roughly 29-30% versus no reminder.
 * - Advanced adds SMS reminders (150/month included). SMS has ~98% open rates, most read within
 *   minutes, and multi-touch SMS reminder programs are documented to cut no-shows by up to ~58-60%,
 *   meaningfully outperforming e-mail-only reminders.
 * See the in-app "i" info panel for the full source list.
 */
export const PACKAGES: readonly Package[] = [
  {
    slug: "basic",
    name: "Basic",
    monthlyPrice: 14.90,
    noShowReduction: 0.3,
    notificationChannel: "email",
    smsCount: null,
    tagline: "E-poštni opomniki",
  },
  {
    slug: "advanced",
    name: "Advanced",
    monthlyPrice: 29.90,
    noShowReduction: 0.6,
    notificationChannel: "sms",
    smsCount: 150,
    tagline: "SMS + e-poštni opomniki",
  },
] as const;

export type PackageSlug = typeof PACKAGES[number]["slug"];

export const DEFAULT_PACKAGE_SLUG: PackageSlug = "advanced";

/**
 * Returns the package for a given slug, falling back to the default package
 * (Advanced) for unknown/invalid slugs.
 */
export function getPackage(slug: string): Package {
  return PACKAGES.find((p) => p.slug === slug) ?? getPackage(DEFAULT_PACKAGE_SLUG);
}

export const DEFAULT_PACKAGE: Package = PACKAGES.find((p) => p.slug === DEFAULT_PACKAGE_SLUG)!;

/**
 * The no-show reduction rate of the default (Advanced/SMS) package.
 * Kept as a standalone constant for callers that don't need a specific package.
 */
export const NOSHOW_REDUCTION = DEFAULT_PACKAGE.noShowReduction;

/**
 * The monthly subscription price of the default (Advanced/SMS) package, in EUR.
 */
export const LIME_MONTHLY_PRICE = DEFAULT_PACKAGE.monthlyPrice;

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
