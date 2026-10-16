"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { UrlState, toQueryString, buildShareUrl } from "../lib/urlState";
import { CategoryPicker } from "./CategoryPicker";
import { RegionPicker } from "./RegionPicker";
import { NoShowInput } from "./NoShowInput";
import { PackagePicker } from "./PackagePicker";
import { PriceInput } from "./PriceInput";
import { AddonsPicker } from "./AddonsPicker";
import { LanguagePicker } from "./LanguagePicker";
import { InfoModal } from "./InfoModal";
import { ResultsPanel } from "./ResultsPanel";
import { RewardsSection } from "./RewardsSection";
import { getPrice, getPackage, AddonSlug } from "../lib/data";
import { calculateSavings } from "../lib/calc";
import { copyToClipboard } from "../lib/clipboard";
import { track } from "../lib/analytics";
import { getTranslations, buildLocalizedFootnote, getPackageText, LANG_TO_URL } from "../lib/i18n";

interface CalculatorProps {
  initialState: UrlState;
}

export const Calculator: React.FC<CalculatorProps> = ({ initialState }) => {
  const router = useRouter();
  const [state, setState] = useState<UrlState>(initialState);
  const [infoOpen, setInfoOpen] = useState(false);

  // Track if this is the first render to avoid redundant routing
  const isFirstRender = useRef(true);

  // Sync state to URL search parameters
  useEffect(() => {
    const query = toQueryString(state);

    // On mount, if URL already matches the state query string, avoid router call
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // check if current URL query matches
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      if (currentQuery === query) {
        return;
      }
    }

    router.replace(query, { scroll: false });
  }, [state, router]);

  const t = getTranslations(state.lang);
  const ctaUrl = LANG_TO_URL[state.lang];

  // Calculate pricing and savings based on current state
  const defaultPrice = getPrice(state.category, state.region);
  const isCustomPrice = state.customPrice !== undefined;
  const price = state.customPrice ?? defaultPrice;
  const addons = {
    extraUsers: state.extraUsers,
    extraLocations: state.extraLocations,
    extraResources: state.extraResources,
  };
  const results = calculateSavings(state.noshows, state.period, price, state.pkg, addons);
  const selectedPackage = getPackage(state.pkg);
  const selectedPackageText = getPackageText(
    selectedPackage.slug,
    selectedPackage.name,
    selectedPackage.tagline,
    selectedPackage.features,
    state.lang
  );

  const handleAddonChange = (slug: AddonSlug, qty: number) => {
    setState((prev) => ({ ...prev, [slug]: qty > 0 ? qty : undefined }));
  };

  // Copy handler
  const handleCopyLink = async () => {
    const baseUrl = typeof window !== "undefined"
      ? window.location.href
      : "http://localhost:3000/";
    const shareUrl = buildShareUrl(state, baseUrl);

    try {
      await copyToClipboard(shareUrl);
      track("copy_link");
      toast.success(t.actions.copySuccess, {
        id: "copy-success-toast",
        duration: 3000,
        style: {
          background: "#548F68",
          color: "#ffffff",
          fontWeight: "600",
          borderRadius: "12px",
          border: "1px solid #427354",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#548F68",
        },
      });
    } catch {
      toast.error(t.actions.copyError, {
        id: "copy-error-toast",
        duration: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16 animate-fadeIn">
      {/* Toast Notification Provider */}
      <Toaster position="bottom-center" />

      {/* Top bar: language picker */}
      <div className="flex justify-end mb-6">
        <LanguagePicker
          value={state.lang}
          onChange={(lang) => setState((prev) => ({ ...prev, lang }))}
        />
      </div>

      {/* Hero section / Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 flex flex-col gap-4">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-sage-50 dark:bg-sage-950/30 text-sage-700 dark:text-sage-400 border border-sage-200/50 dark:border-sage-900/30 rounded-full text-xs font-semibold uppercase tracking-wider w-fit mx-auto">
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
          {t.hero.badge}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {t.hero.title} <span className="text-sage-600 dark:text-sage-400">{t.hero.titleHighlight}</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          {t.hero.subtitle}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls/Inputs (Step by Step) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Step 1: Category Picker */}
          <div className="bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-400 font-bold text-sm">
                1
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {t.steps.category}
              </h2>
            </div>
            <CategoryPicker
              value={state.category}
              onChange={(category) => setState((prev) => ({ ...prev, category }))}
              lang={state.lang}
            />
          </div>

          {/* Step 2: Region Picker */}
          <div className="bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-400 font-bold text-sm">
                2
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {t.steps.region}
              </h2>
            </div>
            <RegionPicker
              value={state.region}
              onChange={(region) => setState((prev) => ({ ...prev, region }))}
              lang={state.lang}
            />

            <div className="h-px bg-gray-100 dark:bg-zinc-800/60 w-full" />

            <PriceInput
              value={price}
              defaultPrice={defaultPrice}
              isCustom={isCustomPrice}
              onChange={(customPrice) => setState((prev) => ({ ...prev, customPrice }))}
              onReset={() => setState((prev) => ({ ...prev, customPrice: undefined }))}
              lang={state.lang}
            />
          </div>

          {/* Step 3: NoShow Input */}
          <div className="bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-400 font-bold text-sm">
                3
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {t.steps.noshows}
              </h2>
            </div>
            <NoShowInput
              value={state.noshows}
              period={state.period}
              onChange={(noshows) => setState((prev) => ({ ...prev, noshows }))}
              onPeriodChange={(period) => setState((prev) => ({ ...prev, period }))}
              lang={state.lang}
            />
          </div>

          {/* Step 4: Package Picker */}
          <div className="bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-400 font-bold text-sm">
                4
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {t.steps.pkg}
              </h2>
            </div>
            <PackagePicker
              value={state.pkg}
              onChange={(pkg) => setState((prev) => ({ ...prev, pkg }))}
              lang={state.lang}
            />
          </div>

          {/* Step 5: Add-ons */}
          <div className="bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-950/50 text-sage-700 dark:text-sage-400 font-bold text-sm">
                5
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {t.steps.addons}
              </h2>
            </div>
            <AddonsPicker
              quantities={addons}
              onChange={handleAddonChange}
              lang={state.lang}
              basePrice={selectedPackage.monthlyPrice}
              packageName={selectedPackageText.name}
            />
          </div>
        </div>

        {/* Right Side: Results + Call to Actions */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 flex flex-col gap-6">
          <ResultsPanel
            monthlyLoss={results.monthlyLoss}
            yearlyLoss={results.yearlyLoss}
            yearlySaving={results.yearlySaving}
            roiMonths={results.roiMonths}
            roiTier={results.roiTier}
            noShowReduction={selectedPackage.noShowReduction}
            footnote={buildLocalizedFootnote(state.pkg, state.lang)}
            onInfoClick={() => setInfoOpen(true)}
            lang={state.lang}
          />
          <InfoModal packageSlug={state.pkg} open={infoOpen} onClose={() => setInfoOpen(false)} lang={state.lang} />

          {/* Copy Link & Share Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              id="copy-link-button"
              type="button"
              onClick={handleCopyLink}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage cursor-pointer shadow-md"
            >
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
                />
              </svg>
              {t.actions.copyLink}
            </button>

            <a
              id="cta-register-button"
              href={ctaUrl}
              onClick={() => track("cta_click")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-sage-600 dark:bg-sage-500 text-white font-semibold text-sm transition-all hover:bg-sage-700 dark:hover:bg-sage-600 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage shadow-md shadow-sage-600/10"
            >
              {t.actions.cta}
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Full-width band: what the yearly saving could actually buy */}
      <RewardsSection yearlySaving={results.yearlySaving} lang={state.lang} />
    </div>
  );
};
