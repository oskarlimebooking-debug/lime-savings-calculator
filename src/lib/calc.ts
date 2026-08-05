import { NOSHOW_REDUCTION, LIME_MONTHLY_PRICE, getPrice, getPackage, DEFAULT_PACKAGE_SLUG, PackageSlug, AddonQuantities, calculateAddonsTotal } from "./data";

export type Period = "weekly" | "monthly";

/**
 * Normalizes no-shows to monthly quantity.
 * If period is weekly, multiplies by 4.33.
 */
export function normalizeNoShows(noShows: number, period: Period): number {
  if (period === "weekly") {
    return noShows * 4.33;
  }
  return noShows;
}

/**
 * Computes monthly loss.
 * `monthlyLoss = noShowsPerMonth × price`
 */
export function calculateMonthlyLoss(noShowsPerMonth: number, price: number): number {
  return noShowsPerMonth * price;
}

/**
 * Computes yearly loss.
 * `yearlyLoss = monthlyLoss × 12`
 */
export function calculateYearlyLoss(monthlyLoss: number): number {
  return monthlyLoss * 12;
}

/**
 * Computes yearly saving.
 * `yearlySaving = yearlyLoss × noShowReduction` (defaults to the Advanced/SMS package's rate)
 */
export function calculateYearlySaving(yearlyLoss: number, noShowReduction: number = NOSHOW_REDUCTION): number {
  return yearlyLoss * noShowReduction;
}

/**
 * Computes monthly saving.
 * `monthlySaving = yearlySaving / 12`
 */
export function calculateMonthlySaving(yearlySaving: number): number {
  return yearlySaving / 12;
}

/**
 * Computes return on investment in months.
 * `roiMonths = packagePrice / monthlySaving` (packagePrice defaults to the Advanced/SMS package's price)
 * Returns Infinity if monthlySaving is 0 or less (guarding divide-by-zero).
 */
export function calculateRoiMonths(monthlySaving: number, packagePrice: number = LIME_MONTHLY_PRICE): number {
  if (monthlySaving <= 0) {
    return Infinity;
  }
  return packagePrice / monthlySaving;
}

/** Average days per month used to convert the ROI period into a day count for display. */
export const ROI_DAYS_PER_MONTH = 30;

/**
 * Returns the ROI tier: 'green' when the payback period is 30 days or less
 * (roiMonths <= 1), else 'warning' (payback takes more than 30 days).
 */
export function roiTier(roiMonths: number): "green" | "warning" {
  return roiMonths <= 1 ? "green" : "warning";
}

export interface CalculationResult {
  noShowsPerMonth: number;
  monthlyLoss: number;
  yearlyLoss: number;
  yearlySaving: number;
  monthlySaving: number;
  roiMonths: number;
  roiTier: "green" | "warning";
}

/**
 * Computes all savings metrics.
 * `packageSlug` selects which Lime Booking package's no-show reduction rate and monthly
 * price to use for the saving/ROI calculation (defaults to the Advanced/SMS package).
 * `addons` optionally adds extra users/locations/resources on top of the package's base
 * price for the ROI calculation (defaults to none).
 */
export function calculateSavings(
  noShows: number,
  period: Period,
  price: number,
  packageSlug: PackageSlug = DEFAULT_PACKAGE_SLUG,
  addons?: AddonQuantities
): CalculationResult {
  const pkg = getPackage(packageSlug);
  const totalMonthlyPrice = pkg.monthlyPrice + calculateAddonsTotal(addons);
  const noShowsPerMonth = normalizeNoShows(noShows, period);
  const monthlyLoss = calculateMonthlyLoss(noShowsPerMonth, price);
  const yearlyLoss = calculateYearlyLoss(monthlyLoss);
  const yearlySaving = calculateYearlySaving(yearlyLoss, pkg.noShowReduction);
  const monthlySaving = calculateMonthlySaving(yearlySaving);
  const roiMonths = calculateRoiMonths(monthlySaving, totalMonthlyPrice);
  const tier = roiTier(roiMonths);

  return {
    noShowsPerMonth,
    monthlyLoss,
    yearlyLoss,
    yearlySaving,
    monthlySaving,
    roiMonths,
    roiTier: tier,
  };
}

/**
 * Formats a value as EUR according to the given locale (defaults to sl-SI).
 * Example: 1234.5 => 1.234,50 €
 */
export function formatEUR(val: number, locale: string = "sl-SI"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    useGrouping: true,
  }).format(val);
}

/**
 * Maps roiMonths to lime-* vs warning class. Mirrors `roiTier`'s 30-day boundary.
 */
export function getRoiClass(roiMonths: number): string {
  return roiMonths <= 1 ? "lime-green" : "warning";
}

/**
 * Formats the ROI period in whole days (roiMonths × 30) according to the given locale
 * (defaults to sl-SI, e.g. 0.3 months => "9"). Returns "-" for non-finite values.
 */
export function getRoiLabelDays(roiMonths: number, locale: string = "sl-SI"): string {
  if (!Number.isFinite(roiMonths)) {
    return "-";
  }
  const days = roiMonths * ROI_DAYS_PER_MONTH;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(days);
}

export interface RoiLabelState {
  category: string;
  region: string;
  noshows: number;
  period: Period;
  /** Optional package slug (defaults to the Advanced/SMS package). */
  packageSlug?: PackageSlug;
  /** Optional override for the average appointment price (defaults to the category/region price). */
  price?: number;
}

/**
 * Computes the ROI text and tier for a given state.
 */
export function roiLabel(state: RoiLabelState): { label: string; tier: "green" | "warning" } {
  const price = state.price ?? getPrice(state.category, state.region);
  const result = calculateSavings(state.noshows, state.period, price, state.packageSlug);
  const formatted = getRoiLabelDays(result.roiMonths);
  return {
    label: `Lime Booking se povrne v ${formatted} dneh`,
    tier: result.roiTier,
  };
}

/**
 * Builds the source footnote text for a given package.
 */
export function buildFootnoteText(packageSlug: PackageSlug = DEFAULT_PACKAGE_SLUG, addons?: AddonQuantities): string {
  const pkg = getPackage(packageSlug);
  const reductionPct = Math.round(pkg.noShowReduction * 100);
  const channelText =
    pkg.notificationChannel === "sms"
      ? `SMS in e-poštnih opomnikov (${pkg.smsCount}/mesec vključenih)`
      : "e-poštnih opomnikov";
  const addonsTotal = calculateAddonsTotal(addons);
  const priceText =
    addonsTotal > 0
      ? `${pkg.monthlyPrice.toFixed(2).replace(".", ",")} €/mesec + ${addonsTotal.toFixed(2).replace(".", ",")} €/mesec dodatkov`
      : `${pkg.monthlyPrice.toFixed(2).replace(".", ",")} €/mesec`;
  return `Zmanjšanje neudeležb za ${reductionPct} % (paket ${pkg.name}) temelji na študijah učinkovitosti ${channelText} pri zmanjševanju neudeležb na terminih (za vire glej ikono z razlago zgoraj). Cena naročnine Lime Booking (${priceText}, brez DDV) temelji na uradnem ceniku Lime Booking.`;
}

export const FOOTNOTE_TEXT = buildFootnoteText(DEFAULT_PACKAGE_SLUG);
