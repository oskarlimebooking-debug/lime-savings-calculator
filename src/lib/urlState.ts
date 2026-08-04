import { CATEGORIES, REGIONS, PACKAGES, CategorySlug, RegionSlug, PackageSlug, DEFAULT_PACKAGE_SLUG } from "./data";
import { Period } from "./calc";

export interface UrlState {
  category: CategorySlug;
  region: RegionSlug;
  noshows: number;
  period: Period;
  pkg: PackageSlug;
  /** Optional user-edited average appointment price override (EUR). Undefined uses the category/region default. */
  customPrice?: number;
}

export type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | string;

export const DEFAULT_CATEGORY: CategorySlug = CATEGORIES[0]?.slug ?? "frizerstvo";
export const DEFAULT_REGION: RegionSlug = REGIONS[0]?.slug ?? "osrednjeslovenska";
export const DEFAULT_NOSHOWS = 0;
export const DEFAULT_PERIOD: Period = "monthly";
export const DEFAULT_PKG: PackageSlug = DEFAULT_PACKAGE_SLUG;

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.slug));
const VALID_REGIONS = new Set<string>(REGIONS.map((r) => r.slug));
const VALID_PERIODS = new Set<string>(["weekly", "monthly"]);
const VALID_PACKAGES = new Set<string>(PACKAGES.map((p) => p.slug));

/**
 * Coerces any input value to a non-negative integer.
 * Negatives, NaN, and other invalid types clamp to 0.
 */
export function coerceNoShows(val: unknown): number {
  if (typeof val === "number") {
    if (isNaN(val) || val < 0) return 0;
    return Math.floor(val);
  }
  if (typeof val === "string") {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }
  return 0;
}

/**
 * Coerces any input value to a positive finite price, or undefined if invalid/absent.
 */
export function coerceCustomPrice(val: unknown): number | undefined {
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val <= 0) return undefined;
    return Math.round(val * 100) / 100;
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return Math.round(parsed * 100) / 100;
  }
  return undefined;
}

/**
 * Extracts a single string value from various search parameter formats.
 */
function getParamValue(
  input: SearchParamsInput | null | undefined,
  key: string
): string | undefined {
  if (!input) return undefined;

  if (input instanceof URLSearchParams) {
    const val = input.get(key);
    return val !== null ? val : undefined;
  }

  if (typeof input === "string") {
    const queryIdx = input.indexOf("?");
    const queryStr = queryIdx !== -1 ? input.slice(queryIdx) : input;
    const cleanStr = queryStr.startsWith("?") ? queryStr.slice(1) : queryStr;
    const params = new URLSearchParams(cleanStr);
    const val = params.get(key);
    return val !== null ? val : undefined;
  }

  if (typeof input === "object") {
    const val = (input as Record<string, unknown>)[key];
    if (Array.isArray(val)) {
      return val[0] !== undefined ? String(val[0]) : undefined;
    }
    return val !== undefined && val !== null ? String(val) : undefined;
  }

  return undefined;
}

/**
 * Parses search parameters into a validated UrlState object.
 * Missing or invalid options fall back to safe defaults.
 */
export function parseParams(searchParams: SearchParamsInput | null | undefined): UrlState {
  const rawCategory = getParamValue(searchParams, "category");
  const category =
    rawCategory && VALID_CATEGORIES.has(rawCategory)
      ? (rawCategory as CategorySlug)
      : DEFAULT_CATEGORY;

  const rawRegion = getParamValue(searchParams, "region");
  const region =
    rawRegion && VALID_REGIONS.has(rawRegion)
      ? (rawRegion as RegionSlug)
      : DEFAULT_REGION;

  const rawNoShows = getParamValue(searchParams, "noshows");
  const noshows = rawNoShows !== undefined ? coerceNoShows(rawNoShows) : DEFAULT_NOSHOWS;

  const rawPeriod = getParamValue(searchParams, "period");
  const period =
    rawPeriod && VALID_PERIODS.has(rawPeriod) ? (rawPeriod as Period) : DEFAULT_PERIOD;

  const rawPkg = getParamValue(searchParams, "pkg");
  const pkg = rawPkg && VALID_PACKAGES.has(rawPkg) ? (rawPkg as PackageSlug) : DEFAULT_PKG;

  const rawCustomPrice = getParamValue(searchParams, "price");
  const customPrice = coerceCustomPrice(rawCustomPrice);

  return {
    category,
    region,
    noshows,
    period,
    pkg,
    ...(customPrice !== undefined ? { customPrice } : {}),
  };
}

/**
 * Serializes a UrlState object (or partial state) into a query string.
 * Ensures the returned string starts with "?" and is round-trip stable.
 */
export function toQueryString(state: Partial<UrlState>): string {
  const params = new URLSearchParams();

  const category = state.category ?? DEFAULT_CATEGORY;
  const region = state.region ?? DEFAULT_REGION;
  const noshows = state.noshows !== undefined ? coerceNoShows(state.noshows) : DEFAULT_NOSHOWS;
  const period = state.period ?? DEFAULT_PERIOD;
  const pkg = state.pkg ?? DEFAULT_PKG;
  const customPrice = coerceCustomPrice(state.customPrice);

  params.set("category", category);
  params.set("region", region);
  params.set("noshows", String(noshows));
  params.set("period", period);
  params.set("pkg", pkg);
  if (customPrice !== undefined) {
    params.set("price", String(customPrice));
  }

  return `?${params.toString()}`;
}

/**
 * Combines a base URL with serialized state into a shareable URL.
 */
export function buildShareUrl(state: UrlState, baseUrl: string): string {
  const cleanBase = baseUrl.split("?")[0];
  return `${cleanBase}${toQueryString(state)}`;
}
