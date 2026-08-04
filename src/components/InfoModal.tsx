"use client";

import React, { useEffect } from "react";
import { getPackage, PackageSlug } from "../lib/data";

interface InfoModalProps {
  packageSlug: PackageSlug;
  open: boolean;
  onClose: () => void;
}

export const InfoTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    id="info-modal-trigger"
    type="button"
    onClick={onClick}
    aria-label="Od kod izhajajo te številke?"
    title="Od kod izhajajo te številke?"
    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 dark:text-gray-500 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/30 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lime-500/50"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>
);

export const InfoModal: React.FC<InfoModalProps> = ({ packageSlug, open, onClose }) => {
  const pkg = getPackage(packageSlug);
  const basic = getPackage("basic");
  const advanced = getPackage("advanced");

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
          aria-label="Zapri"
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="info-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-1">
          Od kod izhajajo te številke?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Metodologija in viri za izračun izpada prihodka in prihrankov.
        </p>

        <div className="flex flex-col gap-5 text-sm text-gray-600 dark:text-gray-300">
          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              Zmanjšanje neudeležb: SMS proti e-pošti
            </h3>
            <p className="mb-2">
              Ne vsi opomniki so enako učinkoviti. SMS ima bistveno višjo stopnjo odprtja
              (okrog 98&nbsp;%, večina v nekaj minutah) kot e-pošta, zato paketi s SMS
              opomniki dosledno bolj znižajo delež neudeležb:
            </p>
            <ul className="flex flex-col gap-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                <span>
                  <strong className="text-gray-800 dark:text-gray-100">{basic.name} (samo e-pošta):</strong>{" "}
                  ~{Math.round(basic.noShowReduction * 100)}&nbsp;% manj neudeležb — sistematični pregledi
                  avtomatskih (ne-SMS) opomnikov beležijo zmanjšanje neudeležb za približno
                  29–30&nbsp;% glede na stanje brez opomnikov.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" />
                <span>
                  <strong className="text-gray-800 dark:text-gray-100">{advanced.name} (SMS + e-pošta):</strong>{" "}
                  ~{Math.round(advanced.noShowReduction * 100)}&nbsp;% manj neudeležb — programi z več
                  SMS opomnikov (npr. 3-stopenjski opomniki) so v raziskavah znižali neudeležbe tudi
                  do ~58–60&nbsp;%, kar SMS opomnike uvršča znatno pred opomnike samo po e-pošti.
                </span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Viri: pregledne študije učinkovitosti opomnikov za termine (npr. objave v Journal of
              Service Management in analize zdravstvenih ter salonskih opomnikovnih sistemov); podatki
              o stopnjah odprtja SMS sporočil iz panožnih analiz komunikacijskih kanalov.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              Trenutno izbrani paket: {pkg.name}
            </h3>
            <p>
              Izračun prihrankov na tej strani uporablja {Math.round(pkg.noShowReduction * 100)}&nbsp;%
              stopnjo zmanjšanja neudeležb, ki ustreza opomnikom preko{" "}
              {pkg.notificationChannel === "sms" ? `SMS-a (${pkg.smsCount}/mesec vključenih) in e-pošte` : "e-pošte"}.
              Menjava paketa zgoraj samodejno posodobi vse spodnje izračune.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              Povprečna cena termina
            </h3>
            <p>
              Privzete cene po panogi in regiji so ocene na podlagi tržnih povprečij v Sloveniji,
              Hrvaški in Srbiji. Ker se cena termina med saloni precej razlikuje, jo lahko v koraku
              za regijo poljubno prilagodite — izračun se takoj posodobi.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              Cena naročnine Lime Booking
            </h3>
            <p>
              Cene paketov ({basic.name}: {basic.monthlyPrice.toFixed(2).replace(".", ",")}&nbsp;€/mesec,{" "}
              {advanced.name}: {advanced.monthlyPrice.toFixed(2).replace(".", ",")}&nbsp;€/mesec, brez DDV)
              so povzete po uradnem ceniku na lime-booking.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
