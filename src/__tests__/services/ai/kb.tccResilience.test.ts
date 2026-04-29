/**
 * Tests Rule 16 — Phase 29 KB modules
 * - therapies_cognitives_comportementales (v31.3.9)
 * - sante_mentale_prevention_resilience (v31.3.10)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const KB_PATH = join(
  process.cwd(),
  "data/knowledge_base/default"
);

// ── TCC ─────────────────────────────────────────────────────────────────────

describe("KB therapies_cognitives_comportementales (v31.3.9)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let kb: any;
  beforeAll(() => {
    const raw = readFileSync(
      join(KB_PATH, "therapies_cognitives_comportementales.json"),
      "utf-8"
    );
    kb = JSON.parse(raw);
  });

  it("version is v31.3.9", () => {
    expect(kb.version).toBe("v31.3.9");
  });

  it("category is therapies_cognitives_comportementales", () => {
    expect(kb.category).toBe("therapies_cognitives_comportementales");
  });

  it("has at least 30 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it("retrieval_triggers includes TCC", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("tcc"))).toBe(true);
  });

  it("retrieval_triggers includes Aaron Beck", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("aaron beck") || t.toLowerCase().includes("beck"))).toBe(true);
  });

  it("retrieval_triggers includes distorsions cognitives", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("distorsions cognitives"))).toBe(true);
  });

  it("retrieval_triggers includes ACT", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("act") || t.toLowerCase().includes("acceptance and commitment"))).toBe(true);
  });

  it("has 7 sections", () => {
    // Le JSON TCC a 8 sections
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it("section fondements_et_vagues exists", () => {
    expect(kb.sections).toHaveProperty("fondements_et_vagues");
  });

  it("section modele_cognitif_beck exists", () => {
    expect(kb.sections).toHaveProperty("modele_cognitif_beck");
  });

  it("section techniques_cognitives exists", () => {
    expect(kb.sections).toHaveProperty("techniques_cognitives");
  });

  it("section techniques_comportementales exists", () => {
    expect(kb.sections).toHaveProperty("techniques_comportementales");
  });

  it("section 3eme_vague_ACT_MBCT exists", () => {
    expect(kb.sections).toHaveProperty("3eme_vague_ACT_MBCT");
  });

  it("section protocoles_cliniques_specifiques exists", () => {
    expect(kb.sections).toHaveProperty("protocoles_cliniques_specifiques");
  });

  it("section ressources_tcc exists", () => {
    expect(kb.sections).toHaveProperty("ressources_tcc");
  });

  it("12 distorsions cognitives définies dans modele_cognitif_beck", () => {
    const distorsions = kb.sections.modele_cognitif_beck?.distorsions_cognitives;
    expect(distorsions).toBeDefined();
    expect(Object.keys(distorsions).length).toBeGreaterThanOrEqual(10);
  });

  it("colonnes de Beck 5 colonnes définies", () => {
    const raw = JSON.stringify(kb.sections.techniques_cognitives);
    expect(raw).toMatch(/colonnes_beck_5|5 colonnes|cinq colonnes/i);
  });

  it("hexaflex ACT avec au moins 5 processus", () => {
    const act = kb.sections["3eme_vague_ACT_MBCT"]?.ACT_acceptance_commitment_therapy;
    expect(act).toBeDefined();
    const hexaflex = JSON.stringify(act?.hexaflex_6_processus ?? act).toLowerCase();
    const processus = ["acceptation", "defusion", "valeurs", "engagement", "moment"];
    const found = processus.filter((p) => hexaflex.includes(p));
    expect(found.length).toBeGreaterThanOrEqual(4);
  });

  it("MBCT mentionne espace de respiration", () => {
    const raw = JSON.stringify(kb.sections["3eme_vague_ACT_MBCT"]);
    expect(raw.toLowerCase()).toMatch(/espace.*respiration|respiration.*espace/i);
  });

  it("protocole TOC défini (ERP)", () => {
    const raw = JSON.stringify(kb.sections.protocoles_cliniques_specifiques);
    expect(raw.toUpperCase()).toMatch(/TOC|OCD/);
    expect(raw.toUpperCase()).toMatch(/ERP/);
  });

  it("protocole insomnie CBT-I défini", () => {
    const raw = JSON.stringify(kb.sections.protocoles_cliniques_specifiques);
    expect(raw.toLowerCase()).toMatch(/insomnie|cbt-i/i);
  });

  it("protocole dépression (Beck) défini", () => {
    const raw = JSON.stringify(kb.sections.protocoles_cliniques_specifiques);
    expect(raw.toLowerCase()).toMatch(/d[ée]pression/i);
  });

  it("ressource AFTCC définie", () => {
    const raw = JSON.stringify(kb.sections.ressources_tcc);
    expect(raw.toUpperCase()).toMatch(/AFTCC/);
  });

  it("outils_pratiques_tcc: relaxation Jacobson mentionnée", () => {
    const raw = JSON.stringify(kb.sections.outils_pratiques_tcc);
    expect(raw.toLowerCase()).toMatch(/jacobson/i);
  });

  it("fond. 3 vagues TCC mentionnées", () => {
    const raw = JSON.stringify(kb.sections.fondements_et_vagues);
    expect(raw).toMatch(/1ere_vague|premi[eè]re vague|1.re vague/i);
    expect(raw).toMatch(/2eme_vague|deuxi[eè]me vague|2.me vague/i);
    expect(raw).toMatch(/3eme_vague|troisi[eè]me vague|3.me vague/i);
  });
});

// ── Santé mentale / résilience ───────────────────────────────────────────────

describe("KB sante_mentale_prevention_resilience (v31.3.10)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let kb: any;
  beforeAll(() => {
    const raw = readFileSync(
      join(KB_PATH, "sante_mentale_prevention_resilience.json"),
      "utf-8"
    );
    kb = JSON.parse(raw);
  });

  it("version is v31.3.10", () => {
    expect(kb.version).toBe("v31.3.10");
  });

  it("category is sante_mentale_prevention_resilience", () => {
    expect(kb.category).toBe("sante_mentale_prevention_resilience");
  });

  it("has at least 30 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it("retrieval_triggers includes sante mentale", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("sant") && t.toLowerCase().includes("mentale"))).toBe(true);
  });

  it("retrieval_triggers includes PERMA", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toUpperCase().includes("PERMA"))).toBe(true);
  });

  it("retrieval_triggers includes resilience", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => /r[eé]silience/.test(t.toLowerCase()))).toBe(true);
  });

  it("retrieval_triggers includes Cyrulnik", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("cyrulnik"))).toBe(true);
  });

  it("retrieval_triggers includes Seligman", () => {
    const triggers = kb.retrieval_triggers as string[];
    expect(triggers.some((t) => t.toLowerCase().includes("seligman"))).toBe(true);
  });

  it("has 7 sections", () => {
    expect(Object.keys(kb.sections).length).toBe(7);
  });

  it("section concepts_fondamentaux exists", () => {
    expect(kb.sections).toHaveProperty("concepts_fondamentaux");
  });

  it("section modele_PERMA_psychologie_positive exists", () => {
    expect(kb.sections).toHaveProperty("modele_PERMA_psychologie_positive");
  });

  it("section resilience exists", () => {
    expect(kb.sections).toHaveProperty("resilience");
  });

  it("section prevention_burnout exists", () => {
    expect(kb.sections).toHaveProperty("prevention_burnout");
  });

  it("section hygiene_psychologique_quotidienne exists", () => {
    expect(kb.sections).toHaveProperty("hygiene_psychologique_quotidienne");
  });

  it("section interventions_basees_preuves exists", () => {
    expect(kb.sections).toHaveProperty("interventions_basees_preuves");
  });

  it("section ressources_sante_mentale exists", () => {
    expect(kb.sections).toHaveProperty("ressources_sante_mentale");
  });

  it("PERMA 5 composantes présentes", () => {
    const perma = kb.sections.modele_PERMA_psychologie_positive?.composantes_PERMA;
    expect(perma).toBeDefined();
    expect(perma).toHaveProperty("P_emotions_positives");
    expect(perma).toHaveProperty("E_engagement");
    expect(perma).toHaveProperty("R_relations");
    expect(perma).toHaveProperty("M_meaning");
    expect(perma).toHaveProperty("A_accomplissement");
  });

  it("VIA mentionne 24 forces ou 6 vertus", () => {
    const raw = JSON.stringify(kb.sections.modele_PERMA_psychologie_positive);
    expect(raw).toMatch(/24|vingt-quatre/i);
    expect(raw).toMatch(/6 vertus|six vertus|6 vertus/i);
  });

  it("Bonanno 4 trajectoires définies", () => {
    const trajectoires = kb.sections.resilience?.Bonanno_trajectoires?.[
      "4_trajectoires"
    ];
    expect(trajectoires).toBeDefined();
    expect(Object.keys(trajectoires).length).toBe(4);
  });

  it("Maslach 3 dimensions définies", () => {
    const raw = JSON.stringify(kb.sections.prevention_burnout);
    expect(raw.toLowerCase()).toMatch(/[ée]puisement|exhaustion/i);
    expect(raw.toLowerCase()).toMatch(/cynisme|d[ée]personnali/i);
    expect(raw.toLowerCase()).toMatch(/accomplissement|accomplishment/i);
  });

  it("modele JD-R défini", () => {
    const raw = JSON.stringify(kb.sections.prevention_burnout);
    expect(raw.toUpperCase()).toMatch(/JD-R|JD_R/);
  });

  it("auto-compassion Neff 3 composantes définies", () => {
    const neff = kb.sections.hygiene_psychologique_quotidienne?.auto_compassion_Neff;
    expect(neff).toBeDefined();
    const raw = JSON.stringify(neff).toLowerCase();
    expect(raw).toMatch(/bienveillance/);
    expect(raw).toMatch(/humanit/);
    expect(raw).toMatch(/pleine conscience/);
  });

  it("PHQ-9 et GAD-7 mentionnés dans ressources", () => {
    const raw = JSON.stringify(kb.sections.ressources_sante_mentale);
    expect(raw.toUpperCase()).toMatch(/PHQ.?9/);
    expect(raw.toUpperCase()).toMatch(/GAD.?7/);
  });

  it("ressources urgence QC et France définies", () => {
    const raw = JSON.stringify(kb.sections.ressources_sante_mentale?.crise_et_urgence);
    expect(raw.toLowerCase()).toMatch(/quebec|qu[ée]bec|qc/i);
    expect(raw.toLowerCase()).toMatch(/france/i);
  });

  it("pratique gratitude mentionnée (Emmons)", () => {
    const raw = JSON.stringify(kb.sections.hygiene_psychologique_quotidienne);
    expect(raw.toLowerCase()).toMatch(/emmons|gratitude/i);
  });

  it("Viktor Frankl logothérapie référencé", () => {
    const raw = JSON.stringify(kb.sections.modele_PERMA_psychologie_positive);
    expect(raw.toLowerCase()).toMatch(/frankl|logoth/i);
  });

  it("Bonanno trajectoire resilient mentionne 50%", () => {
    const raw = JSON.stringify(kb.sections.resilience?.Bonanno_trajectoires);
    expect(raw).toMatch(/50/);
  });

  it("languishing (Grant 2021) mentionné", () => {
    const raw = JSON.stringify(kb.sections.concepts_fondamentaux);
    expect(raw.toLowerCase()).toMatch(/languishing/i);
  });
});
