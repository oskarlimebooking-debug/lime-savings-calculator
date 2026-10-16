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
      borderRadius: {
        card: '12px',
        control: '8px',
        pill: '9999px',
      },
      boxShadow: {
        // The only elevation shadow in the system, and only in the light theme:
        // modals and popovers. Cards and panels lift by surface lightness.
        modal: '0 12px 32px -8px rgba(24, 24, 24, 0.18)',
      },
      spacing: {
        // 4pt rhythm fillers Tailwind's default scale lacks.
        4.5: '1.125rem',
        13: '3.25rem',
      },
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
        // Lime surface layers. Elevation is carried by lightness, not shadow:
        // canvas -> card -> panel -> subtle fill, light and dark separately.
        surface: {
          canvas: '#FAFAFA',
          card: '#FFFFFF',
          panel: '#F5F5F7',
          subtle: '#F0F0F0',
          'dark-canvas': '#121413',
          'dark-card': '#1B1E1C',
          'dark-panel': '#232624',
          'dark-subtle': '#2B2E2C',
        },
        // Hairline dividers, one per theme.
        line: {
          DEFAULT: '#F0F0F0',
          dark: '#2E322F',
        },
        // Text ramp: primary / secondary / tertiary per theme.
        ink: {
          DEFAULT: '#181818',
          muted: '#5C5C5C',
          faint: '#8C8C8C',
          'dark': '#F2F3F1',
          'dark-muted': '#B1B5B2',
          'dark-faint': '#8B8F8D',
        },
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
      },
    },
  },
  plugins: [],
};
export default config;
