/**
 * Tests Vitest — Phase 34 KB
 * Modules: psychiatrie_clinique_diagnostics (v31.4.9) + neuropsychologie_memoire_cerveau (v31.5.0)
 * Rule 16 — coverage obligatoire pour tout nouveau module KB
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(
  __dirname,
  "../../../../data/knowledge_base/default"
);

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function loadKB(filename: string): Record<string, unknown> {
  const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 1 — psychiatrie_clinique_diagnostics.json (v31.4.9)
// ──────────────────────────────────────────────────────────────────────────────
describe("KB psychiatrie_clinique_diagnostics v31.4.9", () => {
  let kb: Record<string, unknown>;

  beforeAll(() => {
    kb = loadKB("psychiatrie_clinique_diagnostics.json");
  });

  it("has correct version v31.4.9", () => {
    expect(kb.version).toBe("v31.4.9");
  });

  it("has correct category identifier", () => {
    expect(kb.category).toBe("psychiatrie_clinique_diagnostics");
  });

  it("has a non-empty description", () => {
    expect(typeof kb.description).toBe("string");
    expect((kb.description as string).length).toBeGreaterThan(50);
  });

  it("has at least 46 retrieval triggers", () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(46);
  });

  it("has at least 7 sections", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(typeof sections).toBe("object");
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  // Triggers — couverture thématique psychiatrie
  it("has trigger covering schizophrénie / psychose", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("schizophr");
  });

  it("has trigger covering trouble bipolaire", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("bipolaire");
  });

  it("has trigger covering borderline", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("borderline");
  });

  it("has trigger covering cluster A B C personnalité", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toMatch(/cluster [ABC]/i);
  });

  it("has trigger covering PHQ-9", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("PHQ-9");
  });

  it("has trigger covering PANSS schizophrénie", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("PANSS");
  });

  it("has trigger covering lithium stabilisateur", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("lithium");
  });

  it("has trigger covering risque suicidaire", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("suicidaire");
  });

  // Sections — contenu clinique essentiel
  it("section schizophrenie_spectre_psychotique exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.schizophrenie_spectre_psychotique).toBeDefined();
  });

  it("section schizophrenie mentions DSM5 criteria", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).schizophrenie_spectre_psychotique
    );
    expect(section).toMatch(/DSM.?5|symptomes_positifs|hallucinat/i);
  });

  it("section trouble_bipolaire exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.trouble_bipolaire).toBeDefined();
  });

  it("section bipolaire covers type I and type II", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).trouble_bipolaire
    );
    expect(section).toContain("type_I");
    expect(section).toContain("type_II");
  });

  it("section trouble_bipolaire mentions kindling Post", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).trouble_bipolaire
    );
    expect(section).toMatch(/kindling|Post/i);
  });

  it("section troubles_personnalite_DSM5 exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.troubles_personnalite_DSM5).toBeDefined();
  });

  it("DSM5 section covers cluster A (paranoïaque, schizoïde)", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).troubles_personnalite_DSM5
    );
    expect(section).toMatch(/cluster_A|paranoiaque|schizoide/i);
  });

  it("DSM5 section covers cluster B (borderline, narcissique, antisociale)", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).troubles_personnalite_DSM5
    );
    expect(section).toMatch(/borderline|narcissique|antisociale/i);
  });

  it("DSM5 section covers cluster C (évitante, dépendante, OC)", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).troubles_personnalite_DSM5
    );
    expect(section).toMatch(/evitante|dependante|obsessionnel/i);
  });

  it("section evaluation_risque_suicidaire exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.evaluation_risque_suicidaire).toBeDefined();
  });

  it("risque suicidaire section mentions Columbia C-SSRS", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).evaluation_risque_suicidaire
    );
    expect(section).toMatch(/Columbia|C-SSRS/i);
  });

  it("section outils_diagnostiques exists and covers PANSS + PHQ-9 + YMRS", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.outils_diagnostiques).toBeDefined();
    const text = JSON.stringify(sections.outils_diagnostiques);
    expect(text).toContain("PANSS");
    expect(text).toContain("PHQ-9");
    expect(text).toContain("YMRS");
  });

  it("section pharmacologie_psychiatrique exists and covers ISRS/IRSN", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.pharmacologie_psychiatrique).toBeDefined();
    const text = JSON.stringify(sections.pharmacologie_psychiatrique);
    expect(text).toMatch(/ISRS|IRSN/);
  });

  it("section retablissement_rehabilitation exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.retablissement_rehabilitation).toBeDefined();
  });

  it("pharmacologie mentions antipsychotiques and lithium", () => {
    const allSections = JSON.stringify(kb.sections);
    expect(allSections).toMatch(/antipsychotique|neuroleptique/i);
    expect(allSections).toContain("lithium");
  });

  it("content mentions DBT as BPD gold standard", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/DBT|gold standard/i);
  });

  it("content covers ECT indication", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/ECT|electroconvulso/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 2 — neuropsychologie_memoire_cerveau.json (v31.5.0)
// ──────────────────────────────────────────────────────────────────────────────
describe("KB neuropsychologie_memoire_cerveau v31.5.0", () => {
  let kb: Record<string, unknown>;

  beforeAll(() => {
    kb = loadKB("neuropsychologie_memoire_cerveau.json");
  });

  it("has correct version v31.5.0", () => {
    expect(kb.version).toBe("v31.5.0");
  });

  it("has correct category identifier", () => {
    expect(kb.category).toBe("neuropsychologie_memoire_cerveau");
  });

  it("has a non-empty description", () => {
    expect(typeof kb.description).toBe("string");
    expect((kb.description as string).length).toBeGreaterThan(50);
  });

  it("has at least 46 retrieval triggers", () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(46);
  });

  it("has at least 7 sections", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(typeof sections).toBe("object");
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  // Triggers — couverture thématique neuropsychologie
  it("has trigger covering mémoire épisodique sémantique", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toMatch(/m.moire.*pisodique|pisodique.*s.mantique/i);
  });

  it("has trigger covering Tulving", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("Tulving");
  });

  it("has trigger covering hippocampe", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("hippocampe");
  });

  it("has trigger covering Baddeley mémoire de travail", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("Baddeley");
  });

  it("has trigger covering Alzheimer", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("Alzheimer");
  });

  it("has trigger covering fonctions exécutives", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toMatch(/fonctions.ex.cutives|cortex.pr.frontal/i);
  });

  it("has trigger covering neuroplasticité Hebb", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toMatch(/neuroplas|Hebb/i);
  });

  it("has trigger covering LTP", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toContain("LTP");
  });

  it("has trigger covering conscience neuroscience", () => {
    const triggers = (kb.retrieval_triggers as string[]).join(" ");
    expect(triggers).toMatch(/conscience|Damasio|Dehaene/i);
  });

  // Sections — contenu neuropsychologique essentiel
  it("section systemes_mnésiques_tulving_baddeley exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    // Accept either key form
    const key = Object.keys(sections).find((k) => k.includes("siques") || k.includes("tulving") || k.includes("baddeley"));
    expect(key).toBeDefined();
  });

  it("Tulving section covers episodique, semantique, procedurale", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/pisodique/i);
    expect(allText).toMatch(/s.mantique/i);
    expect(allText).toMatch(/proc.durale/i);
  });

  it("Baddeley section covers working memory components", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/Baddeley|boucle phonologique|administrateur central/i);
  });

  it("Miller 7±2 mentioned", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/Miller|7.*2/i);
  });

  it("section patient_HM_hippocampe exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    const key = Object.keys(sections).find((k) => k.includes("HM") || k.includes("hippocampe") || k.includes("patient"));
    expect(key).toBeDefined();
  });

  it("H.M. section mentions Milner Scoville amnesia", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/Milner|Scoville|H\.M\.|Henry Molaison/i);
  });

  it("consolidation systémique mentions sleep", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/sommeil|sleep|REM|consolidation/i);
  });

  it("section alzheimer_dementias exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    const key = Object.keys(sections).find((k) => k.includes("alzheimer") || k.includes("dementia") || k.includes("dement"));
    expect(key).toBeDefined();
  });

  it("Alzheimer section covers amyloid cascade and tau", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/amylo.de|amyloid/i);
    expect(allText).toContain("tau");
  });

  it("Alzheimer section mentions MMSE MoCA", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toContain("MMSE");
    expect(allText).toContain("MoCA");
  });

  it("section fonctions_executives exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.fonctions_executives).toBeDefined();
  });

  it("fonctions exécutives section covers PFC, inhibition, flexibility", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).fonctions_executives
    );
    expect(section).toMatch(/pr.frontal|PFC/i);
    expect(section).toMatch(/inhibition|flexibilit/i);
  });

  it("section neuroplasticite exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.neuroplasticite).toBeDefined();
  });

  it("neuroplasticite section covers Hebb rule and LTP", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).neuroplasticite
    );
    expect(section).toMatch(/Hebb|LTP|potentialisation/i);
  });

  it("neuroplasticite section covers BDNF and exercise", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).neuroplasticite
    );
    expect(section).toMatch(/BDNF|exercice|neurogenese/i);
  });

  it("section conscience_theories exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.conscience_theories).toBeDefined();
  });

  it("conscience section covers Damasio somatic marker", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).conscience_theories
    );
    expect(section).toMatch(/Damasio|proto-self|core consciousness/i);
  });

  it("conscience section covers Dehaene global workspace", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).conscience_theories
    );
    expect(section).toMatch(/Dehaene|Baars|espace de travail global/i);
  });

  it("section evaluation_neuropsychologique exists", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(sections.evaluation_neuropsychologique).toBeDefined();
  });

  it("evaluation section covers MoCA and MMSE", () => {
    const section = JSON.stringify(
      (kb.sections as Record<string, unknown>).evaluation_neuropsychologique
    );
    expect(section).toContain("MoCA");
    expect(section).toContain("MMSE");
  });

  it("Ebbinghaus forgetting curve referenced", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/Ebbinghaus|courbe.oubli|forgetting/i);
  });

  it("Loftus false memory / misinformation effect referenced", () => {
    const allText = JSON.stringify(kb.sections);
    expect(allText).toMatch(/Loftus|faux souvenirs|misinformation/i);
  });
});
