import { NOSHOW_REDUCTION, LIME_MONTHLY_PRICE, getPrice } from "./data";

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
 * `yearlySaving = yearlyLoss × NOSHOW_REDUCTION`
 */
export function calculateYearlySaving(yearlyLoss: number): number {
  return yearlyLoss * NOSHOW_REDUCTION;
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
 * `roiMonths = LIME_MONTHLY_PRICE / monthlySaving`
 * Returns Infinity if monthlySaving is 0 or less (guarding divide-by-zero).
 */
export function calculateRoiMonths(monthlySaving: number): number {
  if (monthlySaving <= 0) {
    return Infinity;
  }
  return LIME_MONTHLY_PRICE / monthlySaving;
}

/**
 * Returns the ROI tier: 'green' when < 2, else 'warning'.
 */
export function roiTier(roiMonths: number): "green" | "warning" {
  return roiMonths < 2 ? "green" : "warning";
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
 */
export function calculateSavings(
  noShows: number,
  period: Period,
  price: number
): CalculationResult {
  const noShowsPerMonth = normalizeNoShows(noShows, period);
  const monthlyLoss = calculateMonthlyLoss(noShowsPerMonth, price);
  const yearlyLoss = calculateYearlyLoss(monthlyLoss);
  const yearlySaving = calculateYearlySaving(yearlyLoss);
  const monthlySaving = calculateMonthlySaving(yearlySaving);
  const roiMonths = calculateRoiMonths(monthlySaving);
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
 * Formats a value as EUR according to sl-SI locale.
 * Example: 1234.5 => 1.234,50 €
 */
export function formatEUR(val: number): string {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    useGrouping: true,
  }).format(val);
}

/**
 * Maps roiMonths to lime-* vs warning class.
 */
export function getRoiClass(roiMonths: number): string {
  return roiMonths < 2 ? "lime-green" : "warning";
}

/**
 * Formats ROI months in Slovenian decimal format (e.g. 1.3 => "1,3").
 * Returns "-" for non-finite values.
 */
export function getRoiLabelMonths(roiMonths: number): string {
  if (!Number.isFinite(roiMonths)) {
    return "-";
  }
  return new Intl.NumberFormat("sl-SI", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(roiMonths);
}

export interface RoiLabelState {
  category: string;
  region: string;
  noshows: number;
  period: Period;
}

/**
 * Computes the ROI text and tier for a given state.
 */
export function roiLabel(state: RoiLabelState): { label: string; tier: "green" | "warning" } {
  const price = getPrice(state.category, state.region);
  const result = calculateSavings(state.noshows, state.period, price);
  const formatted = getRoiLabelMonths(result.roiMonths);
  return {
    label: `Lime Booking se povrne v ${formatted} mesecih`,
    tier: result.roiTier,
  };
}

export const FOOTNOTE_TEXT = "Zmanjšanje neudeležb za 60 % temelji na industrijskih študijah o digitalnih rezervacijah (npr. Journal of Service Management, 2022). Cena naročnine Lime Booking (14,90 €/mesec brez DDV) temelji na osnovnem paketu za samostojne/mikro salone na limebooking.si.";
