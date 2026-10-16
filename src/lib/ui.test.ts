import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buttonClass,
  cardClass,
  badgeClass,
  chipClass,
  inputClass,
  BadgeStatus,
} from "./ui";

/** Komponente, prenovljene v T2.1 — nobena ne sme več imeti surovih lime razredov. */
const REFACTORED = [
  "CategoryPicker",
  "RegionPicker",
  "PackagePicker",
  "AddonsPicker",
  "NoShowInput",
  "PriceInput",
  "LanguagePicker",
];

const BADGE_STATUSES: BadgeStatus[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
  "popular",
];

describe("buttonClass", () => {
  it("AC1: primarni gumb nosi CTA polnilo, belo oznako in sage fokus ring", () => {
    const cls = buttonClass("primary");
    expect(cls).toContain("bg-sage-500");
    expect(cls).toContain("text-white");
    expect(cls).toContain("focus:ring-sage-500/50");
  });

  it("AC1: primarni gumb ima hover in pressed stopnji", () => {
    const cls = buttonClass("primary");
    expect(cls).toContain("hover:bg-sage-600");
    expect(cls).toContain("active:bg-sage-700");
  });

  it("AC1: ghost varianta ne vsebuje polnila ozadja", () => {
    const cls = buttonClass("ghost");
    expect(cls).not.toMatch(/(^|\s)bg-/);
    // fokus ring ostane tudi brez polnila
    expect(cls).toContain("focus:ring-sage-500/50");
  });

  it("velikosti dajo različne nize, privzeto md", () => {
    expect(buttonClass("primary", "sm")).not.toBe(buttonClass("primary", "lg"));
    expect(buttonClass("primary")).toBe(buttonClass("primary", "md"));
  });

  it("je čista funkcija — enak vhod, enak izhod", () => {
    expect(buttonClass("secondary", "lg")).toBe(buttonClass("secondary", "lg"));
  });
});

describe("chipClass", () => {
  it("AC2: izbrano in neizbrano stanje se razlikujeta", () => {
    expect(chipClass(true)).not.toBe(chipClass(false));
  });

  it("AC2: izbrana varianta vsebuje sage wash razred", () => {
    expect(chipClass(true)).toContain("bg-sage-50/60");
    expect(chipClass(true)).toContain("border-sage-500");
  });

  it("neizbrana varianta ne nosi sage polnila", () => {
    expect(chipClass(false)).not.toContain("bg-sage-");
  });
});

describe("badgeClass", () => {
  it("AC3: vseh 6 statusov vrne unikaten in neprazen niz", () => {
    const out = BADGE_STATUSES.map((s) => badgeClass(s));
    out.forEach((cls) => expect(cls.trim().length).toBeGreaterThan(0));
    expect(new Set(out).size).toBe(BADGE_STATUSES.length);
  });

  it("neznan status pade na neutral namesto na prazen niz", () => {
    const cls = badgeClass("nekaj-cudnega" as BadgeStatus);
    expect(cls).toBe(badgeClass("neutral"));
  });
});

describe("cardClass", () => {
  it("elevated doda močnejšo senco", () => {
    expect(cardClass(true)).toContain("shadow-xl");
    expect(cardClass(false)).not.toContain("shadow-xl");
    expect(cardClass()).toBe(cardClass(false));
  });
});

describe("inputClass", () => {
  it("vnosno polje ima sage fokus stanje", () => {
    expect(inputClass()).toContain("focus:ring-sage-500/40");
    expect(inputClass()).toContain("focus:border-sage-500");
  });
});

describe("prenovljene komponente", () => {
  const read = (name: string) =>
    readFileSync(join(__dirname, "..", "components", `${name}.tsx`), "utf8");

  it.each(REFACTORED)("AC4: %s ne vsebuje surovih bg-lime- razredov", (name) => {
    expect(read(name)).not.toContain("bg-lime-");
  });

  it.each(REFACTORED)("%s ne vsebuje nobenega lime- razreda", (name) => {
    expect(read(name)).not.toContain("lime-");
  });

  it.each(REFACTORED)("%s uvozi vsaj en primitiv iz lib/ui", (name) => {
    expect(read(name)).toMatch(/from "\.\.\/lib\/ui"/);
  });
});
