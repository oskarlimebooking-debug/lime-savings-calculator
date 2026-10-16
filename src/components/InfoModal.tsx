"use client";

import React, { useEffect } from "react";
import { getPackage, PackageSlug } from "../lib/data";
import { Lang, getTranslations, getPackageText } from "../lib/i18n";

interface InfoModalProps {
  packageSlug: PackageSlug;
  open: boolean;
  onClose: () => void;
  lang: Lang;
}

export const InfoTrigger: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label }) => (
  <button
    id="info-modal-trigger"
    type="button"
    onClick={onClick}
    aria-label={label ?? "Od kod izhajajo te številke?"}
    title={label ?? "Od kod izhajajo te številke?"}
    className="inline-flex items-center justify-center w-11 h-11 rounded-full text-gray-400 dark:text-gray-500 hover:text-sage-600 dark:hover:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-950/30 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sage"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>
);

export const InfoModal: React.FC<InfoModalProps> = ({ packageSlug, open, onClose, lang }) => {
  const t = getTranslations(lang);
  const pkg = getPackage(packageSlug);
  const basic = getPackage("basic");
  const advanced = getPackage("advanced");
  const basicText = getPackageText(basic.slug, basic.name, basic.tagline, basic.features, lang);
  const advancedText = getPackageText(advanced.slug, advanced.name, advanced.tagline, advanced.features, lang);
  const pkgText = getPackageText(pkg.slug, pkg.name, pkg.tagline, pkg.features, lang);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const basicPct = Math.round(basic.noShowReduction * 100);
  const advancedPct = Math.round(advanced.noShowReduction * 100);
  const pkgPct = Math.round(pkg.noShowReduction * 100);
  const pkgChannel =
    pkg.notificationChannel === "sms" ? t.info.smsChannel(pkg.smsCount ?? 0) : t.info.emailChannel;

  return (
    <div
      id="info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        id="info-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl popIn"
      >
        <button
          id="info-modal-close"
          type="button"
          onClick={onClose}
          aria-label={t.info.close}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="info-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-1">
          {t.info.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.info.subtitle}</p>

        <div className="flex flex-col gap-5 text-sm text-gray-600 dark:text-gray-300">
          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">{t.info.channelHeading}</h3>
            <p className="mb-2">{t.info.channelIntro}</p>
            <ul className="flex flex-col gap-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                <span>{t.info.basicBullet(basicPct, basicText.name)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sage-500 flex-shrink-0" />
                <span>{t.info.advancedBullet(advancedPct, advancedText.name)}</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{t.info.sources}</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              {t.info.currentPackageHeading(pkgText.name)}
            </h3>
            <p>{t.info.currentPackageBody(pkgPct, pkgChannel)}</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">{t.info.priceHeading}</h3>
            <p>{t.info.priceBody}</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">{t.info.subscriptionHeading}</h3>
            <p>
              {t.info.subscriptionBody(
                basicText.name,
                basic.monthlyPrice.toFixed(2).replace(".", ","),
                advancedText.name,
                advanced.monthlyPrice.toFixed(2).replace(".", ",")
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
