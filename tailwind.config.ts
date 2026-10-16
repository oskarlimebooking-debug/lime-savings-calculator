import type { Config } from "tailwindcss";

// Sage: the CTA/brand ramp used by the shared UI primitives (src/lib/ui.ts).
// 500 is the CTA green #548F68 from the design spec.
const sage = {
  50: '#f3f7f4',
  100: '#e2ece6',
  200: '#c4d9cc',
  300: '#9bbfa9',
  400: '#74a386',
  500: '#548F68',
  600: '#427354',
  700: '#365c44',
  800: '#2c4938',
  900: '#253c2f',
  950: '#12201a',
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // src/lib/ui.ts holds the shared class-string primitives, so it must be
    // scanned too or Tailwind never emits those utilities.
    "./src/lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Lime type hierarchy tokens used by the results panel and chart.
        h1: ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'body-m': ['0.9375rem', { lineHeight: '1.5' }],
        caption: ['0.6875rem', { lineHeight: '1.45' }],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Lime Booking brand palette. `sage` is the identity green (focus ring,
        // accents), `cta` the button green with its hover/pressed shades.
        brand: {
          sage: '#74B587',
          cta: '#548F68',
          ctaHover: '#447856',
          ctaPressed: '#3D6D4D',
        },
        focus: '#74B587',
        danger: '#F46969',
        default: '#8C8C8C',
        // ROI status tokens. The DEFAULT values are the spec hexes; `strong` is
        // the darker text shade, because #4FB870 / #EDA300 as text on white sit
        // near 2:1 contrast and would fail WCAG AA.
        success: {
          DEFAULT: '#4FB870',
          soft: '#EAF7EF',
          strong: '#2E7A4A',
        },
        warning: {
          DEFAULT: '#EDA300',
          soft: '#FDF4E0',
          strong: '#8A6000',
        },
        // Lime Booking accent palette (vanilija, mango, breskev, bezev, sivka,
        // hortenzija, plavica). Keep in sync with ACCENT in src/lib/ui.ts —
        // src/lib/ui.test.ts asserts the two stay identical.
        accent: {
          vanilla: '#FDF6DD',
          mango: '#EDA300',
          peach: '#F6DFDF',
          beige: '#F7F3FA',
          lavender: '#A881C6',
          hydrangea: '#E0ECF4',
          cornflower: '#2D8CCA',
        },
        sage,
        // Legacy alias: components not yet migrated still use `lime-*` classes,
        // so the ramp points at sage instead of the generic Tailwind green.
        lime: sage,
      },
    },
  },
  plugins: [],
};
export default config;
