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
      fontFamily: {
        // Inter is loaded in src/app/layout.tsx and exposed as --font-inter.
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Lime universal type scale — identical at every breakpoint, so there
        // are no responsive variants of these tokens.
        h1: ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.25px' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.25px' }],
        h3: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        h4: ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body-l': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-m': ['14px', { lineHeight: '21px', fontWeight: '400' }],
        subtitle: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '17px', fontWeight: '400' }],
        button: ['14px', { lineHeight: '17px', fontWeight: '500' }],
        // `label` pairs with the `uppercase` utility; text-transform is not a
        // fontSize token in Tailwind.
        label: ['11px', { lineHeight: '15px', fontWeight: '500', letterSpacing: '0.4px' }],
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
