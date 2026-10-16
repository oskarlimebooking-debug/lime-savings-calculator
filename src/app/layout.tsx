import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Korenski fallback: `src/app/page.tsx` ga prek `generateMetadata` prepiše s
// stanjem kalkulatorja, ta naslov se vidi le, ko tega stanja ni.
export const metadata: Metadata = {
  title: "Lime Booking — kalkulator prihranka",
  description:
    "Izračunajte, koliko vas letno stanejo neprihodi strank in koliko od tega vrne Lime Booking.",
  icons: {
    icon: "/favicon-circle.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
