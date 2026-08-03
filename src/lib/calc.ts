import { NOSHOW_REDUCTION, LIME_MONTHLY_PRICE } from "./data";

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
