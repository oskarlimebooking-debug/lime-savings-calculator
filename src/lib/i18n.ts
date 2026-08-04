import { CategorySlug, RegionSlug, PackageSlug, AddonSlug, CATEGORIES, REGIONS, getPackage, DEFAULT_PACKAGE_SLUG } from "./data";
import { formatEUR } from "./calc";

export type Lang = "sl" | "hr" | "sr" | "en";

export interface LanguageOption {
  code: Lang;
  label: string;
  flag: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: "sl", label: "Slovenščina", flag: "🇸🇮" },
  { code: "hr", label: "Hrvatski", flag: "🇭🇷" },
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export const DEFAULT_LANG: Lang = "sl";

const VALID_LANGS = new Set<string>(LANGUAGES.map((l) => l.code));

export function isValidLang(val: unknown): val is Lang {
  return typeof val === "string" && VALID_LANGS.has(val);
}

/** The localized Lime Booking marketing site to link the CTA button to, per language. */
export const LANG_TO_URL: Record<Lang, string> = {
  sl: "https://lime-booking.si/",
  hr: "https://lime-booking.hr/",
  sr: "https://lime-booking.rs/",
  en: "https://lime-booking.com/",
};

/** Intl locale used for currency/number formatting, per language. */
export const LANG_LOCALE: Record<Lang, string> = {
  sl: "sl-SI",
  hr: "hr-HR",
  sr: "sr-RS",
  en: "en-GB",
};

function getLangOrDefault(lang: Lang): Lang {
  return VALID_LANGS.has(lang) ? lang : DEFAULT_LANG;
}

// ---------------------------------------------------------------------------
// Category / region display name overrides. Slovenian ("sl") always falls
// back to the canonical name in data.ts, so only non-sl overrides live here.
// ---------------------------------------------------------------------------

const CATEGORY_NAME_OVERRIDES: Partial<Record<Lang, Partial<Record<CategorySlug, string>>>> = {
  hr: {
    frizerstvo: "Frizerski saloni",
    brivstvo: "Brijačnice",
    "kozmeticni-saloni": "Kozmetički saloni",
    "druge-lepotne-storitve": "Ostale usluge ljepote",
  },
  sr: {
    frizerstvo: "Frizerski saloni",
    brivstvo: "Berbernice",
    "kozmeticni-saloni": "Kozmetički saloni",
    "druge-lepotne-storitve": "Ostale usluge lepote",
  },
  en: {
    frizerstvo: "Hair Salons",
    brivstvo: "Barbershops",
    "kozmeticni-saloni": "Beauty Salons",
    "druge-lepotne-storitve": "Other Beauty Services",
  },
};

const REGION_NAME_OVERRIDES: Partial<Record<Lang, Partial<Record<RegionSlug, string>>>> = {
  hr: { hr: "Hrvatska" },
  sr: { hr: "Hrvatska" },
  en: {
    osrednjeslovenska: "Central Slovenia",
    celjska: "Celje Region",
    maribor: "Maribor",
    primorska: "Littoral (Primorska)",
    gorenjska: "Upper Carniola (Gorenjska)",
    ostalo: "Other",
    hr: "Croatia",
    rs: "Serbia",
  },
};

export function getCategoryName(slug: CategorySlug, lang: Lang): string {
  const fallback = CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  return CATEGORY_NAME_OVERRIDES[getLangOrDefault(lang)]?.[slug] ?? fallback;
}

export function getRegionName(slug: RegionSlug, lang: Lang): string {
  const fallback = REGIONS.find((r) => r.slug === slug)?.name ?? slug;
  return REGION_NAME_OVERRIDES[getLangOrDefault(lang)]?.[slug] ?? fallback;
}

// ---------------------------------------------------------------------------
// Package name / tagline / feature overrides. "Growth" and "Pro" are used
// as-is across every language (already English product-line names in the
// official pricing). "sl" falls back to data.ts.
// ---------------------------------------------------------------------------

interface PackageText {
  name?: string;
  tagline: string;
  features: readonly string[];
}

const PACKAGE_TEXT: Partial<Record<Lang, Partial<Record<PackageSlug, PackageText>>>> = {
  hr: {
    basic: {
      tagline: "E-mail podsjetnici",
      features: ["Online kalendar", "Online zakazivanje", "E-mail obavijesti", "Analitika"],
    },
    advanced: {
      tagline: "SMS + e-mail podsjetnici",
      features: ["150 SMS podsjetnika/mjesec", "Grupni termini", "Predujmovi (avansna plaćanja)", "Kombinirane usluge"],
    },
    growth: {
      tagline: "SMS podsjetnici + red čekanja",
      features: ["Red čekanja", "Akcije i popusti za klijente", "Naziv tvrtke u SMS-ovima", "Sobe i uređaji"],
    },
    pro: {
      tagline: "SMS na više jezika + napredne cijene",
      features: ["SMS obavijesti na više jezika", "Dinamičko trajanje usluga", "Tarifne cijene", "Pixel & CAPI integracija"],
    },
  },
  sr: {
    basic: {
      tagline: "Email podsetnici",
      features: ["Online kalendar", "Online zakazivanje", "Email obaveštenja", "Analitika"],
    },
    advanced: {
      tagline: "SMS + email podsetnici",
      features: ["150 SMS podsetnika/mesec", "Grupni termini", "Avansna plaćanja", "Kombinovane usluge"],
    },
    growth: {
      tagline: "SMS podsetnici + red čekanja",
      features: ["Red čekanja", "Akcije i popusti za klijente", "Naziv firme u SMS porukama", "Sobe i uređaji"],
    },
    pro: {
      tagline: "SMS na više jezika + napredne cene",
      features: ["SMS obaveštenja na više jezika", "Dinamičko trajanje usluga", "Tarifne cene", "Pixel & CAPI integracija"],
    },
  },
  en: {
    basic: {
      name: "Basic",
      tagline: "Email reminders",
      features: ["Online calendar", "Online booking", "Email notifications", "Analytics"],
    },
    advanced: {
      name: "Advanced",
      tagline: "SMS + email reminders",
      features: ["150 SMS reminders/month", "Group appointments", "Advance payments", "Combined services"],
    },
    growth: {
      tagline: "SMS reminders + waitlist",
      features: ["Waitlist", "Client promotions & discounts", "Company name in SMS", "Rooms & equipment"],
    },
    pro: {
      tagline: "Multi-language SMS + advanced pricing",
      features: ["Multi-language SMS notifications", "Dynamic service duration", "Tariff pricing", "Pixel & CAPI integration"],
    },
  },
};

export function getPackageText(pkgSlug: PackageSlug, fallbackName: string, fallbackTagline: string, fallbackFeatures: readonly string[], lang: Lang) {
  const override = PACKAGE_TEXT[getLangOrDefault(lang)]?.[pkgSlug];
  return {
    name: override?.name ?? fallbackName,
    tagline: override?.tagline ?? fallbackTagline,
    features: override?.features ?? fallbackFeatures,
  };
}

const ADDON_NAME_OVERRIDES: Partial<Record<Lang, Partial<Record<AddonSlug, string>>>> = {
  hr: {
    extraUsers: "Dodatni korisnik",
    extraLocations: "Dodatna lokacija",
    extraResources: "Dodatni resurs",
  },
  sr: {
    extraUsers: "Dodatni korisnik",
    extraLocations: "Dodatna lokacija",
    extraResources: "Dodatni resurs",
  },
  en: {
    extraUsers: "Extra user",
    extraLocations: "Extra location",
    extraResources: "Extra resource",
  },
};

export function getAddonName(slug: AddonSlug, fallbackName: string, lang: Lang): string {
  return ADDON_NAME_OVERRIDES[getLangOrDefault(lang)]?.[slug] ?? fallbackName;
}

// ---------------------------------------------------------------------------
// Main UI copy dictionary.
// ---------------------------------------------------------------------------

export interface Translations {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
  };
  steps: {
    category: string;
    region: string;
    noshows: string;
    pkg: string;
    addons: string;
  };
  noShowInput: {
    periodLabel: string;
    weekly: string;
    monthly: string;
    countLabel: string;
    perWeek: string;
    perMonth: string;
  };
  priceInput: {
    label: string;
    reset: (price: string) => string;
    custom: string;
    default: string;
  };
  packagePicker: {
    recommended: string;
    perMonth: string;
    reductionApprox: (pct: number) => string;
  };
  addons: {
    heading: string;
    description: string;
    perMonth: string;
    totalLabel: string;
    baseLabel: (packageName: string) => string;
  };
  info: {
    triggerLabel: string;
    title: string;
    subtitle: string;
    channelHeading: string;
    channelIntro: string;
    basicBullet: (pct: number, name: string) => string;
    advancedBullet: (pct: number, name: string) => string;
    sources: string;
    currentPackageHeading: (name: string) => string;
    currentPackageBody: (pct: number, channel: string) => string;
    smsChannel: (count: number) => string;
    emailChannel: string;
    priceHeading: string;
    priceBody: string;
    subscriptionHeading: string;
    subscriptionBody: (basicName: string, basicPrice: string, advancedName: string, advancedPrice: string) => string;
    close: string;
  };
  footnote: {
    text: (pct: number, packageName: string, channel: string, price: string) => string;
  };
  results: {
    heading: string;
    subheading: string;
    monthlyLoss: string;
    yearlyLoss: string;
    yearlySaving: string;
    savingAssumption: (pct: number) => string;
    roiLabel: (months: string) => string;
    roiGreen: string;
    roiWarning: string;
  };
  chart: {
    heading: string;
    empty: string;
    withoutLime: string;
    withLime: string;
    lossSuffix: string;
    legendLoss: string;
    legendSaving: (pct: number) => string;
  };
  actions: {
    copyLink: string;
    copySuccess: string;
    copyError: string;
    cta: string;
  };
  languagePicker: {
    label: string;
  };
  meta: {
    title: (category: string, region: string, loss: string) => string;
    description: (category: string, region: string, loss: string) => string;
    imageAlt: (category: string, region: string) => string;
  };
}

const sl: Translations = {
  hero: {
    badge: "Kalkulator prihrankov",
    title: "Lime kalkulator",
    titleHighlight: "prihrankov",
    subtitle:
      "Izračunajte, koliko prihodka izgubljate zaradi neudeležb strank in spoznajte, kako vam lahko Lime Booking povrne izgubljeni čas in denar.",
  },
  steps: {
    category: "Izberite vašo dejavnost",
    region: "Izberite vašo regijo",
    noshows: "Koliko neudeležb (no-shows) zabeležite?",
    pkg: "Izberite paket Lime Booking",
    addons: "Dodatki k paketu",
  },
  noShowInput: {
    periodLabel: "Obdobje izpadov",
    weekly: "Tedensko",
    monthly: "Mesečno",
    countLabel: "Število neudeležb",
    perWeek: "na teden",
    perMonth: "na mesec",
  },
  priceInput: {
    label: "Povprečna cena termina",
    reset: (price) => `Ponastavi na privzeto (${price})`,
    custom: "vaša cena (prilagojeno)",
    default: "privzeto za vašo regijo/panogo",
  },
  packagePicker: {
    recommended: "Priporočeno",
    perMonth: "/mesec",
    reductionApprox: (pct) => `zmanjšanje neudeležb ~${pct} %`,
  },
  addons: {
    heading: "Dodatki k paketu",
    description: "Privzeto brez dodatkov. Če potrebujete več uporabnikov, lokacij ali sredstev, jih dodajte spodaj.",
    perMonth: "€/mesec",
    totalLabel: "Skupna mesečna cena Lime Booking",
    baseLabel: (packageName) => `paket ${packageName}`,
  },
  info: {
    triggerLabel: "Od kod izhajajo te številke?",
    title: "Od kod izhajajo te številke?",
    subtitle: "Metodologija in viri za izračun izpada prihodka in prihrankov.",
    channelHeading: "Zmanjšanje neudeležb: SMS proti e-pošti",
    channelIntro:
      "Vsi opomniki niso enako učinkoviti. SMS ima bistveno višjo stopnjo odprtja (okrog 98 %, večina v nekaj minutah) kot e-pošta, zato paketi s SMS opomniki dosledno bolj znižajo delež neudeležb:",
    basicBullet: (pct, name) =>
      `${name} (samo e-pošta): ~${pct} % manj neudeležb — sistematični pregledi učinkovitosti avtomatskih e-poštnih opomnikov beležijo zmanjšanje neudeležb za približno 29–30 % glede na stanje brez opomnikov.`,
    advancedBullet: (pct, name) =>
      `${name} (SMS + e-pošta): ~${pct} % manj neudeležb — programi z več SMS opomnikov (npr. 3-stopenjski opomniki) so v raziskavah znižali neudeležbe tudi do ~58–60 %, s čimer SMS opomniki občutno prekašajo opomnike, poslane zgolj po e-pošti.`,
    sources:
      'Viri: pregledne študije učinkovitosti opomnikov za termine (npr. objave v Journal of Service Management in analize zdravstvenih ter salonskih opomnikovnih sistemov); podatki o stopnjah odprtja SMS sporočil iz panožnih analiz komunikacijskih kanalov.',
    currentPackageHeading: (name) => `Trenutno izbrani paket: ${name}`,
    currentPackageBody: (pct, channel) =>
      `Izračun prihrankov na tej strani uporablja ${pct} % stopnjo zmanjšanja neudeležb, ki ustreza opomnikom preko ${channel}. Menjava paketa zgoraj samodejno posodobi vse spodnje izračune.`,
    smsChannel: (count) => `SMS-a (${count}/mesec vključenih) in e-pošte`,
    emailChannel: "e-pošte",
    priceHeading: "Povprečna cena termina",
    priceBody:
      "Privzete cene po panogi in regiji so ocene na podlagi tržnih povprečij v Sloveniji, Hrvaški in Srbiji. Ker se cena termina med saloni precej razlikuje, jo lahko v koraku za regijo poljubno prilagodite — izračun se takoj posodobi.",
    subscriptionHeading: "Cena naročnine Lime Booking",
    subscriptionBody: (basicName, basicPrice, advancedName, advancedPrice) =>
      `Cene paketov (${basicName}: ${basicPrice} €/mesec, ${advancedName}: ${advancedPrice} €/mesec, brez DDV) so povzete po uradnem ceniku Lime Booking.`,
    close: "Zapri",
  },
  footnote: {
    text: (pct, packageName, channel, price) =>
      `Zmanjšanje neudeležb za ${pct} % (paket ${packageName}) temelji na študijah učinkovitosti ${channel} pri zmanjševanju neudeležb na terminih (za vire glej ikono z razlago zgoraj). Cena naročnine Lime Booking (${price}, brez DDV) temelji na uradnem ceniku Lime Booking.`,
  },
  results: {
    heading: "Izračun izpada in prihrankov",
    subheading: "Pregled finančnih učinkov neudeležb in potenciala za izboljšanje.",
    monthlyLoss: "Mesečni izpad prihodka",
    yearlyLoss: "Letni izpad prihodka",
    yearlySaving: "Letni prihranek z Lime Booking",
    savingAssumption: (pct) => `Ob predpostavki ${pct} % zmanjšanja števila neudeležb z avtomatskimi opomniki.`,
    roiLabel: (months) => `Lime Booking se povrne v ${months} mesecih`,
    roiGreen: "Izjemno hitra povrnitev investicije!",
    roiWarning: "Povrnitev investicije na podlagi trenutnih nastavitev.",
  },
  chart: {
    heading: "Izpad prihodka: brez in z Lime Booking",
    empty: "Vnesite število neudeležb za prikaz grafa.",
    withoutLime: "Brez Lime Booking",
    withLime: "Z Lime Booking",
    lossSuffix: "izpada",
    legendLoss: "Izpad prihodka",
    legendSaving: (pct) => `Prihranek (${pct} %)`,
  },
  actions: {
    copyLink: "Kopiraj povezavo",
    copySuccess: "Povezava kopirana v odložišče!",
    copyError: "Napaka pri kopiranju povezave v odložišče.",
    cta: "Preizkusi Lime Booking",
  },
  languagePicker: {
    label: "Jezik",
  },
  meta: {
    title: (category, region, loss) => `${category} v ${region}: letna izguba €${loss} | Lime Savings Calculator`,
    description: (category, region, loss) =>
      `Letna izguba za ${category} v regiji ${region} zaradi no-shows je €${loss}. Preprečite izpad in prihranite z Lime Booking!`,
    imageAlt: (category, region) => `${category} v ${region} letna izguba`,
  },
};

const hr: Translations = {
  hero: {
    badge: "Kalkulator uštede",
    title: "Lime kalkulator",
    titleHighlight: "uštede",
    subtitle:
      "Izračunajte koliko prihoda gubite zbog izostanaka klijenata i saznajte kako vam Lime Booking može vratiti izgubljeno vrijeme i novac.",
  },
  steps: {
    category: "Odaberite svoju djelatnost",
    region: "Odaberite svoju regiju",
    noshows: "Koliko izostanaka (no-shows) bilježite?",
    pkg: "Odaberite Lime Booking paket",
    addons: "Dodaci paketu",
  },
  noShowInput: {
    periodLabel: "Razdoblje izostanaka",
    weekly: "Tjedno",
    monthly: "Mjesečno",
    countLabel: "Broj izostanaka",
    perWeek: "tjedno",
    perMonth: "mjesečno",
  },
  priceInput: {
    label: "Prosječna cijena termina",
    reset: (price) => `Vrati na zadano (${price})`,
    custom: "vaša cijena (prilagođeno)",
    default: "zadano za vašu regiju/djelatnost",
  },
  packagePicker: {
    recommended: "Preporučeno",
    perMonth: "/mjesec",
    reductionApprox: (pct) => `smanjenje izostanaka ~${pct} %`,
  },
  addons: {
    heading: "Dodaci paketu",
    description: "Zadano bez dodataka. Ako trebate više korisnika, lokacija ili resursa, dodajte ih ispod.",
    perMonth: "€/mjesec",
    totalLabel: "Ukupna mjesečna cijena Lime Booking",
    baseLabel: (packageName) => `paket ${packageName}`,
  },
  info: {
    triggerLabel: "Odakle dolaze ovi brojevi?",
    title: "Odakle dolaze ovi brojevi?",
    subtitle: "Metodologija i izvori za izračun gubitka prihoda i uštede.",
    channelHeading: "Smanjenje izostanaka: SMS naspram e-maila",
    channelIntro:
      "Svi podsjetnici nisu jednako učinkoviti. SMS ima znatno višu stopu otvaranja (oko 98 %, većina unutar nekoliko minuta) od e-maila, stoga paketi sa SMS podsjetnicima dosljedno više smanjuju udio izostanaka:",
    basicBullet: (pct, name) =>
      `${name} (samo e-mail): ~${pct} % manje izostanaka — sustavni pregledi učinkovitosti automatskih e-mail podsjetnika bilježe smanjenje izostanaka za otprilike 29–30 % u odnosu na stanje bez podsjetnika.`,
    advancedBullet: (pct, name) =>
      `${name} (SMS + e-mail): ~${pct} % manje izostanaka — programi s više SMS podsjetnika (npr. trostupanjski podsjetnici) u istraživanjima su smanjili izostanke i do ~58–60 %, čime SMS podsjetnici znatno nadmašuju podsjetnike poslane isključivo e-mailom.`,
    sources:
      "Izvori: pregledne studije učinkovitosti podsjetnika za termine (npr. objave u Journal of Service Management i analize zdravstvenih te salonskih sustava podsjetnika); podaci o stopama otvaranja SMS poruka iz industrijskih analiza komunikacijskih kanala.",
    currentPackageHeading: (name) => `Trenutno odabrani paket: ${name}`,
    currentPackageBody: (pct, channel) =>
      `Izračun uštede na ovoj stranici koristi stopu smanjenja izostanaka od ${pct} %, koja odgovara podsjetnicima putem ${channel}. Promjena paketa iznad automatski ažurira sve izračune ispod.`,
    smsChannel: (count) => `SMS-a (${count}/mjesec uključeno) i e-maila`,
    emailChannel: "e-maila",
    priceHeading: "Prosječna cijena termina",
    priceBody:
      "Zadane cijene po djelatnosti i regiji procjene su na temelju tržišnih prosjeka u Sloveniji, Hrvatskoj i Srbiji. Budući da se cijena termina znatno razlikuje među salonima, u koraku za regiju možete je proizvoljno prilagoditi — izračun se odmah ažurira.",
    subscriptionHeading: "Cijena pretplate Lime Booking",
    subscriptionBody: (basicName, basicPrice, advancedName, advancedPrice) =>
      `Cijene paketa (${basicName}: ${basicPrice} €/mjesec, ${advancedName}: ${advancedPrice} €/mjesec, bez PDV-a) preuzete su iz službenog cjenika Lime Booking.`,
    close: "Zatvori",
  },
  footnote: {
    text: (pct, packageName, channel, price) =>
      `Smanjenje izostanaka za ${pct} % (paket ${packageName}) temelji na studijama učinkovitosti ${channel} pri smanjenju izostanaka na terminima (za izvore pogledajte ikonu s objašnjenjem iznad). Cijena pretplate Lime Booking (${price}, bez PDV-a) temelji na službenom cjeniku Lime Booking.`,
  },
  results: {
    heading: "Izračun gubitka i uštede",
    subheading: "Pregled financijskih učinaka izostanaka i potencijala za poboljšanje.",
    monthlyLoss: "Mjesečni gubitak prihoda",
    yearlyLoss: "Godišnji gubitak prihoda",
    yearlySaving: "Godišnja ušteda s Lime Booking",
    savingAssumption: (pct) => `Uz pretpostavku smanjenja broja izostanaka za ${pct} % putem automatskih podsjetnika.`,
    roiLabel: (months) => `Lime Booking se isplati za ${months} mjeseci`,
    roiGreen: "Iznimno brz povrat ulaganja!",
    roiWarning: "Povrat ulaganja na temelju trenutnih postavki.",
  },
  chart: {
    heading: "Gubitak prihoda: bez i s Lime Booking",
    empty: "Unesite broj izostanaka za prikaz grafa.",
    withoutLime: "Bez Lime Booking",
    withLime: "S Lime Booking",
    lossSuffix: "gubitka",
    legendLoss: "Gubitak prihoda",
    legendSaving: (pct) => `Ušteda (${pct} %)`,
  },
  actions: {
    copyLink: "Kopiraj poveznicu",
    copySuccess: "Poveznica kopirana u međuspremnik!",
    copyError: "Greška pri kopiranju poveznice u međuspremnik.",
    cta: "Isprobajte Lime Booking",
  },
  languagePicker: {
    label: "Jezik",
  },
  meta: {
    title: (category, region, loss) => `${category} u ${region}: godišnji gubitak €${loss} | Lime Savings Calculator`,
    description: (category, region, loss) =>
      `Godišnji gubitak za ${category} u regiji ${region} zbog izostanaka je €${loss}. Spriječite gubitak i uštedite s Lime Booking!`,
    imageAlt: (category, region) => `${category} u ${region} godišnji gubitak`,
  },
};

const sr: Translations = {
  hero: {
    badge: "Kalkulator uštede",
    title: "Lime kalkulator",
    titleHighlight: "uštede",
    subtitle:
      "Izračunajte koliko prihoda gubite zbog izostanaka klijenata i saznajte kako vam Lime Booking može vratiti izgubljeno vreme i novac.",
  },
  steps: {
    category: "Izaberite svoju delatnost",
    region: "Izaberite svoj region",
    noshows: "Koliko izostanaka (no-shows) beležite?",
    pkg: "Izaberite Lime Booking paket",
    addons: "Dodaci paketu",
  },
  noShowInput: {
    periodLabel: "Period izostanaka",
    weekly: "Nedeljno",
    monthly: "Mesečno",
    countLabel: "Broj izostanaka",
    perWeek: "nedeljno",
    perMonth: "mesečno",
  },
  priceInput: {
    label: "Prosečna cena termina",
    reset: (price) => `Vrati na podrazumevano (${price})`,
    custom: "vaša cena (prilagođeno)",
    default: "podrazumevano za vaš region/delatnost",
  },
  packagePicker: {
    recommended: "Preporučeno",
    perMonth: "/mesec",
    reductionApprox: (pct) => `smanjenje izostanaka ~${pct} %`,
  },
  addons: {
    heading: "Dodaci paketu",
    description: "Podrazumevano bez dodataka. Ako vam treba više korisnika, lokacija ili resursa, dodajte ih ispod.",
    perMonth: "€/mesec",
    totalLabel: "Ukupna mesečna cena Lime Booking",
    baseLabel: (packageName) => `paket ${packageName}`,
  },
  info: {
    triggerLabel: "Odakle dolaze ovi brojevi?",
    title: "Odakle dolaze ovi brojevi?",
    subtitle: "Metodologija i izvori za izračun gubitka prihoda i uštede.",
    channelHeading: "Smanjenje izostanaka: SMS naspram email-a",
    channelIntro:
      "Svi podsetnici nisu podjednako efikasni. SMS ima znatno višu stopu otvaranja (oko 98 %, većina u roku od nekoliko minuta) od email-a, zato paketi sa SMS podsetnicima dosledno više smanjuju udeo izostanaka:",
    basicBullet: (pct, name) =>
      `${name} (samo email): ~${pct} % manje izostanaka — sistematski pregledi efikasnosti automatskih email podsetnika beleže smanjenje izostanaka za približno 29–30 % u odnosu na stanje bez podsetnika.`,
    advancedBullet: (pct, name) =>
      `${name} (SMS + email): ~${pct} % manje izostanaka — programi sa više SMS podsetnika (npr. trostepeni podsetnici) su u istraživanjima smanjili izostanke i do ~58–60 %, čime SMS podsetnici značajno nadmašuju podsetnike poslate isključivo putem email-a.`,
    sources:
      "Izvori: pregledne studije efikasnosti podsetnika za termine (npr. objave u Journal of Service Management i analize zdravstvenih i salonskih sistema podsetnika); podaci o stopama otvaranja SMS poruka iz industrijskih analiza komunikacionih kanala.",
    currentPackageHeading: (name) => `Trenutno izabrani paket: ${name}`,
    currentPackageBody: (pct, channel) =>
      `Izračun uštede na ovoj stranici koristi stopu smanjenja izostanaka od ${pct} %, koja odgovara podsetnicima putem ${channel}. Promena paketa iznad automatski ažurira sve izračune ispod.`,
    smsChannel: (count) => `SMS-a (${count}/mesec uključeno) i email-a`,
    emailChannel: "email-a",
    priceHeading: "Prosečna cena termina",
    priceBody:
      "Podrazumevane cene po delatnosti i regionu su procene na osnovu tržišnih proseka u Sloveniji, Hrvatskoj i Srbiji. Pošto se cena termina dosta razlikuje između salona, u koraku za region je možete proizvoljno prilagoditi — izračun se odmah ažurira.",
    subscriptionHeading: "Cena pretplate Lime Booking",
    subscriptionBody: (basicName, basicPrice, advancedName, advancedPrice) =>
      `Cene paketa (${basicName}: ${basicPrice} €/mesec, ${advancedName}: ${advancedPrice} €/mesec, bez PDV-a) preuzete su iz zvaničnog cenovnika Lime Booking.`,
    close: "Zatvori",
  },
  footnote: {
    text: (pct, packageName, channel, price) =>
      `Smanjenje izostanaka za ${pct} % (paket ${packageName}) zasniva se na studijama efikasnosti ${channel} pri smanjenju izostanaka na terminima (za izvore pogledajte ikonicu sa objašnjenjem iznad). Cena pretplate Lime Booking (${price}, bez PDV-a) zasniva se na zvaničnom cenovniku Lime Booking.`,
  },
  results: {
    heading: "Izračun gubitka i uštede",
    subheading: "Pregled finansijskih efekata izostanaka i potencijala za poboljšanje.",
    monthlyLoss: "Mesečni gubitak prihoda",
    yearlyLoss: "Godišnji gubitak prihoda",
    yearlySaving: "Godišnja ušteda sa Lime Booking",
    savingAssumption: (pct) => `Uz pretpostavku smanjenja broja izostanaka za ${pct} % putem automatskih podsetnika.`,
    roiLabel: (months) => `Lime Booking se isplati za ${months} meseci`,
    roiGreen: "Izuzetno brz povraćaj ulaganja!",
    roiWarning: "Povraćaj ulaganja na osnovu trenutnih podešavanja.",
  },
  chart: {
    heading: "Gubitak prihoda: bez i sa Lime Booking",
    empty: "Unesite broj izostanaka za prikaz grafikona.",
    withoutLime: "Bez Lime Booking",
    withLime: "Sa Lime Booking",
    lossSuffix: "gubitka",
    legendLoss: "Gubitak prihoda",
    legendSaving: (pct) => `Ušteda (${pct} %)`,
  },
  actions: {
    copyLink: "Kopiraj link",
    copySuccess: "Link kopiran u privremenu memoriju!",
    copyError: "Greška pri kopiranju linka u privremenu memoriju.",
    cta: "Isprobajte Lime Booking",
  },
  languagePicker: {
    label: "Jezik",
  },
  meta: {
    title: (category, region, loss) => `${category} u ${region}: godišnji gubitak €${loss} | Lime Savings Calculator`,
    description: (category, region, loss) =>
      `Godišnji gubitak za ${category} u regionu ${region} zbog izostanaka je €${loss}. Sprečite gubitak i uštedite sa Lime Booking!`,
    imageAlt: (category, region) => `${category} u ${region} godišnji gubitak`,
  },
};

const en: Translations = {
  hero: {
    badge: "Savings calculator",
    title: "Lime savings",
    titleHighlight: "calculator",
    subtitle:
      "Calculate how much revenue you're losing to client no-shows, and see how Lime Booking can win back your lost time and money.",
  },
  steps: {
    category: "Choose your business type",
    region: "Choose your region",
    noshows: "How many no-shows do you get?",
    pkg: "Choose your Lime Booking plan",
    addons: "Plan add-ons",
  },
  noShowInput: {
    periodLabel: "No-show period",
    weekly: "Weekly",
    monthly: "Monthly",
    countLabel: "Number of no-shows",
    perWeek: "per week",
    perMonth: "per month",
  },
  priceInput: {
    label: "Average appointment price",
    reset: (price) => `Reset to default (${price})`,
    custom: "your price (customized)",
    default: "default for your region/industry",
  },
  packagePicker: {
    recommended: "Recommended",
    perMonth: "/month",
    reductionApprox: (pct) => `~${pct} % fewer no-shows`,
  },
  addons: {
    heading: "Plan add-ons",
    description: "No add-ons by default. If you need more users, locations, or resources, add them below.",
    perMonth: "€/month",
    totalLabel: "Total monthly Lime Booking price",
    baseLabel: (packageName) => `${packageName} plan`,
  },
  info: {
    triggerLabel: "Where do these numbers come from?",
    title: "Where do these numbers come from?",
    subtitle: "Methodology and sources behind the revenue-loss and savings calculation.",
    channelHeading: "No-show reduction: SMS vs. email",
    channelIntro:
      "Not all reminders are equally effective. SMS has a far higher open rate (around 98 %, most read within minutes) than email, so plans with SMS reminders consistently cut no-shows by more:",
    basicBullet: (pct, name) =>
      `${name} (email only): ~${pct} % fewer no-shows — systematic reviews of automated email-only reminder effectiveness report roughly a 29–30 % no-show reduction versus no reminders at all.`,
    advancedBullet: (pct, name) =>
      `${name} (SMS + email): ~${pct} % fewer no-shows — multi-touch SMS reminder programs (e.g. 3-step reminder sequences) have been shown in research to cut no-shows by up to ~58–60 %, meaningfully outperforming email-only reminders.`,
    sources:
      "Sources: systematic reviews of appointment-reminder effectiveness (e.g. published in the Journal of Service Management and analyses of healthcare/salon reminder systems); SMS open-rate data from industry communication-channel benchmarks.",
    currentPackageHeading: (name) => `Currently selected plan: ${name}`,
    currentPackageBody: (pct, channel) =>
      `The savings calculation on this page uses a ${pct} % no-show reduction rate, matching reminders sent via ${channel}. Switching plans above instantly updates every calculation below.`,
    smsChannel: (count) => `SMS (${count}/month included) and email`,
    emailChannel: "email",
    priceHeading: "Average appointment price",
    priceBody:
      "Default prices by industry and region are estimates based on market averages in Slovenia, Croatia, and Serbia. Since appointment prices vary a lot between salons, you can freely adjust it in the region step — the calculation updates instantly.",
    subscriptionHeading: "Lime Booking subscription price",
    subscriptionBody: (basicName, basicPrice, advancedName, advancedPrice) =>
      `Plan prices (${basicName}: €${basicPrice}/month, ${advancedName}: €${advancedPrice}/month, excl. VAT) are taken from the official Lime Booking price list.`,
    close: "Close",
  },
  footnote: {
    text: (pct, packageName, channel, price) =>
      `A ${pct} % no-show reduction (${packageName} plan) is based on studies of the effectiveness of ${channel} in reducing appointment no-shows (see the info icon above for sources). The Lime Booking subscription price (${price}, excl. VAT) is based on the official Lime Booking price list.`,
  },
  results: {
    heading: "Loss & savings calculation",
    subheading: "An overview of the financial impact of no-shows and the potential for improvement.",
    monthlyLoss: "Monthly revenue loss",
    yearlyLoss: "Yearly revenue loss",
    yearlySaving: "Yearly savings with Lime Booking",
    savingAssumption: (pct) => `Assuming a ${pct} % reduction in no-shows from automated reminders.`,
    roiLabel: (months) => `Lime Booking pays for itself in ${months} months`,
    roiGreen: "Exceptionally fast return on investment!",
    roiWarning: "Return on investment based on your current settings.",
  },
  chart: {
    heading: "Revenue loss: without vs. with Lime Booking",
    empty: "Enter your number of no-shows to see the chart.",
    withoutLime: "Without Lime Booking",
    withLime: "With Lime Booking",
    lossSuffix: "in losses",
    legendLoss: "Revenue loss",
    legendSaving: (pct) => `Savings (${pct} %)`,
  },
  actions: {
    copyLink: "Copy link",
    copySuccess: "Link copied to clipboard!",
    copyError: "Failed to copy the link to your clipboard.",
    cta: "Try Lime Booking",
  },
  languagePicker: {
    label: "Language",
  },
  meta: {
    title: (category, region, loss) => `${category} in ${region}: yearly loss €${loss} | Lime Savings Calculator`,
    description: (category, region, loss) =>
      `The yearly revenue loss for ${category} in the ${region} region due to no-shows is €${loss}. Prevent the loss and save with Lime Booking!`,
    imageAlt: (category, region) => `${category} in ${region} yearly loss`,
  },
};

const DICTIONARIES: Record<Lang, Translations> = { sl, hr, sr, en };

export function getTranslations(lang: Lang): Translations {
  return DICTIONARIES[getLangOrDefault(lang)];
}

/**
 * Builds the source footnote text for a given package, localized to `lang`.
 */
export function buildLocalizedFootnote(packageSlug: PackageSlug = DEFAULT_PACKAGE_SLUG, lang: Lang = DEFAULT_LANG): string {
  const t = getTranslations(lang);
  const pkg = getPackage(packageSlug);
  const pkgText = getPackageText(pkg.slug, pkg.name, pkg.tagline, pkg.features, lang);
  const reductionPct = Math.round(pkg.noShowReduction * 100);
  const channelText = pkg.notificationChannel === "sms" ? t.info.smsChannel(pkg.smsCount ?? 0) : t.info.emailChannel;
  const priceText = `${formatEUR(pkg.monthlyPrice, LANG_LOCALE[getLangOrDefault(lang)])}${t.packagePicker.perMonth}`;
  return t.footnote.text(reductionPct, pkgText.name, channelText, priceText);
}
