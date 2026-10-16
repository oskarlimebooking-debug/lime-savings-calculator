/**
 * Skupni slogovni primitivi.
 *
 * Čiste funkcije, ki vračajo nize Tailwind razredov, da izbirniki ne podvajajo
 * ad-hoc razredov. Barvna lestvica `sage` je definirana v `tailwind.config.ts`;
 * `sage-500` je CTA zelena `#548F68`.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type BadgeStatus =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "popular";

/** Skupna osnova vseh gumbov: postavitev, prehodi in sage fokus ring. */
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl " +
  "transition-all duration-200 cursor-pointer disabled:opacity-30 " +
  "disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sage-500/50";

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // CTA: polnilo sage-500, bela oznaka, temnejši hover/pressed stopnji.
  primary: "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sm",
  secondary:
    "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 border " +
    "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
  // Ghost nima polnila ozadja — samo barva besedila.
  ghost:
    "text-gray-600 dark:text-gray-300 hover:text-sage-700 dark:hover:text-sage-300",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
): string {
  return `${BUTTON_BASE} ${BUTTON_SIZE[size]} ${BUTTON_VARIANT[variant]}`;
}

export function cardClass(elevated = false): string {
  return (
    "rounded-2xl border border-gray-200 dark:border-gray-800 " +
    "bg-white dark:bg-zinc-900 " +
    (elevated ? "shadow-xl" : "shadow-sm")
  );
}

const BADGE_BASE =
  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold " +
  "uppercase tracking-wider flex-shrink-0";

const BADGE_STATUS: Record<BadgeStatus, string> = {
  neutral: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400",
  info: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  success: "bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300",
  warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  danger: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300",
  popular: "bg-sage-500 text-white",
};

export function badgeClass(status: BadgeStatus = "neutral"): string {
  return `${BADGE_BASE} ${BADGE_STATUS[status] ?? BADGE_STATUS.neutral}`;
}

// Brez radija: vsak izbirnik si ga določi sam (xl / 2xl / full).
const CHIP_BASE =
  "border transition-all duration-300 cursor-pointer " +
  "focus:outline-none focus:ring-2 focus:ring-sage-500/50";

export function chipClass(selected: boolean): string {
  return selected
    ? // Sage wash: svetlo polnilo + sage obroba za izbrano stanje.
      `${CHIP_BASE} border-sage-500 bg-sage-50/60 dark:bg-sage-950/20 text-sage-700 dark:text-sage-300 shadow-sm`
    : `${CHIP_BASE} border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700`;
}

/** Vnosno polje (številka/besedilo) s sage fokus stanjem. */
export function inputClass(): string {
  return (
    "px-3 py-2.5 text-center font-bold text-lg border border-gray-200 " +
    "dark:border-gray-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-800 " +
    "dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sage-500/40 " +
    "focus:border-sage-500 transition-all duration-200"
  );
}

/**
 * Lime Booking accent palette (vanilija, mango, breskev, bezev, sivka, hortenzija,
 * plavica). Mirrors `colors.accent` in `tailwind.config.ts`; `ui.test.ts` asserts the two stay
 * in sync, so the chart can use exact hexes for flat fills without drifting from the
 * token definition.
 */
export const ACCENT = {
  vanilla: "#FDF6DD",
  mango: "#EDA300",
  peach: "#F6DFDF",
  beige: "#F7F3FA",
  lavender: "#A881C6",
  hydrangea: "#E0ECF4",
  cornflower: "#2D8CCA",
} as const;

export type ChartSeries = "loss" | "saving";

/**
 * Flat fill colour per chart series — no gradients, one accent hue each: the saving
 * carries the stronger plavica, the residual loss the quieter sivka.
 */
export function chartSeriesColor(series: ChartSeries): string {
  return series === "saving" ? ACCENT.cornflower : ACCENT.lavender;
}
