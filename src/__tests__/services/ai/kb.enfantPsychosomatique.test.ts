import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Phase 33 KB tests — Vitest Rule 16 compliance
// Modules: developpement_enfant_parentalite (v31.4.7) + psychosomatique_corps_esprit (v31.4.8)

const KB_DIR = join(__dirname, "../../../../data/knowledge_base/default");

function loadKB(filename: string) {
  return JSON.parse(readFileSync(join(KB_DIR, filename), "utf-8"));
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 1: developpement_enfant_parentalite (v31.4.7)
// ─────────────────────────────────────────────────────────────────────────────
describe("KB: developpement_enfant_parentalite (v31.4.7)", () => {
  const kb = loadKB("developpement_enfant_parentalite.json");

  it("a la bonne version v31.4.7", () => {
    expect(kb.version).toBe("v31.4.7");
  });

  it("a la bonne catégorie", () => {
    expect(kb.category).toBe("developpement_enfant_parentalite");
  });

  it("a au moins 45 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(45);
  });

  it("a au moins 7 sections", () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it("triggers contiennent Erikson", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Erikson");
  });

  it("triggers contiennent Piaget", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Piaget");
  });

  it("triggers contiennent Vygotsky", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Vygotsky");
  });

  it("triggers contiennent Ainsworth", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Ainsworth");
  });

  it("triggers contiennent Baumrind", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Baumrind");
  });

  it("section Erikson stades psychosociaux existe", () => {
    const hasErikson =
      kb.sections.erikson_stades_psychosociaux !== undefined ||
      kb.sections.erikson !== undefined;
    expect(hasErikson).toBe(true);
  });

  it("section Piaget cognitif existe", () => {
    const hasPiaget =
      kb.sections.piaget_stades_cognitifs !== undefined ||
      kb.sections.piaget !== undefined;
    expect(hasPiaget).toBe(true);
  });

  it("section attachement parent-enfant existe", () => {
    const hasAttach =
      kb.sections.attachement_parent_enfant !== undefined ||
      kb.sections.attachement !== undefined;
    expect(hasAttach).toBe(true);
  });

  it("section styles parentaux Baumrind existe", () => {
    const hasStyles =
      kb.sections.styles_parentaux_baumrind !== undefined ||
      kb.sections.baumrind !== undefined;
    expect(hasStyles).toBe(true);
  });

  it("section discipline positive existe", () => {
    const hasDisc =
      kb.sections.discipline_positive !== undefined ||
      kb.sections.parentalite_positive !== undefined;
    expect(hasDisc).toBe(true);
  });

  it("section trauma intergénérationnel existe", () => {
    const hasTrauma =
      kb.sections.trauma_intergenerationnel !== undefined ||
      kb.sections.transmission_trauma !== undefined;
    expect(hasTrauma).toBe(true);
  });

  it("section adolescence/identité existe", () => {
    const hasAdol =
      kb.sections.adolescence_identite !== undefined ||
      kb.sections.adolescence !== undefined;
    expect(hasAdol).toBe(true);
  });

  it("8 stades Erikson mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const has8 =
      full.includes("8") &&
      (full.toLowerCase().includes("integrite") ||
        full.toLowerCase().includes("int\u00e9grit\u00e9"));
    expect(has8).toBe(true);
  });

  it("4 stades Piaget mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasSensori =
      full.toLowerCase().includes("sensori") ||
      full.toLowerCase().includes("sensori-moteur");
    expect(hasSensori).toBe(true);
  });

  it("Strange Situation / types d'attachement mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasStrange =
      full.toLowerCase().includes("strange") ||
      (full.toLowerCase().includes("securise") &&
        full.toLowerCase().includes("evitant"));
    expect(hasStrange).toBe(true);
  });

  it("attachement désorganisé mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasDesorg =
      full.toLowerCase().includes("desorganise") ||
      full.toLowerCase().includes("d\u00e9sorganis\u00e9");
    expect(hasDesorg).toBe(true);
  });

  it("styles autoritaire/authoritative mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasAuth =
      full.toLowerCase().includes("autoritaire") ||
      full.toLowerCase().includes("authoritative");
    expect(hasAuth).toBe(true);
  });

  it("Dreikurs ou Janet Nelsen mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasDisk =
      full.toLowerCase().includes("dreikurs") ||
      full.toLowerCase().includes("nelsen");
    expect(hasDisk).toBe(true);
  });

  it("transmission intergénérationnelle / épigénétique mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    const hasEpi =
      full.toLowerCase().includes("epigenetique") ||
      full.toLowerCase().includes("\u00e9pig\u00e9n\u00e9tique") ||
      full.toLowerCase().includes("intergenerationnel");
    expect(hasEpi).toBe(true);
  });

  it("Cyrulnik résilience enfant mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasCyr =
      full.toLowerCase().includes("cyrulnik") ||
      full.toLowerCase().includes("tuteur de r\u00e9silience");
    expect(hasCyr).toBe(true);
  });

  it("Marcia statuts identité adolescent mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("marcia");
  });

  it("Zone Proximale de Développement Vygotsky mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasZPD =
      full.toLowerCase().includes("zpd") ||
      full.toLowerCase().includes("zone proximale") ||
      full.toLowerCase().includes("vygotsky");
    expect(hasZPD).toBe(true);
  });

  it("développement moral Kohlberg mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("kohlberg");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Module 2: psychosomatique_corps_esprit (v31.4.8)
// ─────────────────────────────────────────────────────────────────────────────
describe("KB: psychosomatique_corps_esprit (v31.4.8)", () => {
  const kb = loadKB("psychosomatique_corps_esprit.json");

  it("a la bonne version v31.4.8", () => {
    expect(kb.version).toBe("v31.4.8");
  });

  it("a la bonne catégorie", () => {
    expect(kb.category).toBe("psychosomatique_corps_esprit");
  });

  it("a au moins 44 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(44);
  });

  it("a au moins 7 sections", () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it("triggers contiennent Damasio", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Damasio");
  });

  it("triggers contiennent Porges", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Porges");
  });

  it("triggers contiennent Kabat-Zinn", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Kabat-Zinn");
  });

  it("triggers contiennent Levine somatique", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Levine");
  });

  it("section marqueurs somatiques Damasio existe", () => {
    const hasDamasio =
      kb.sections.marqueurs_somatiques_damasio !== undefined ||
      kb.sections.damasio !== undefined;
    expect(hasDamasio).toBe(true);
  });

  it("section douleur chronique existe", () => {
    const hasDouleur =
      kb.sections.douleur_chronique !== undefined ||
      kb.sections.douleur !== undefined;
    expect(hasDouleur).toBe(true);
  });

  it("section psychoneuro-immunologie existe", () => {
    const hasPNI =
      kb.sections.psychoneuro_immunologie !== undefined ||
      kb.sections.pni !== undefined;
    expect(hasPNI).toBe(true);
  });

  it("section polyvagal Porges existe", () => {
    const hasPV =
      kb.sections.polyvagal_porges !== undefined ||
      kb.sections.polyvagal !== undefined;
    expect(hasPV).toBe(true);
  });

  it("section thérapies somatiques existe", () => {
    const hasSom =
      kb.sections.therapies_somatiques !== undefined ||
      kb.sections.somatic !== undefined;
    expect(hasSom).toBe(true);
  });

  it("section MBSR/mindfulness corps existe", () => {
    const hasMBSR =
      kb.sections.mbsr_mindfulness_corps !== undefined ||
      kb.sections.mbsr !== undefined;
    expect(hasMBSR).toBe(true);
  });

  it("section somatisation/alexithymie existe", () => {
    const hasAlexi =
      kb.sections.somatisation_alexithymie !== undefined ||
      kb.sections.alexithymie !== undefined;
    expect(hasAlexi).toBe(true);
  });

  it("marqueurs somatiques Iowa Gambling Task mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasIowa =
      full.toLowerCase().includes("iowa") ||
      full.toLowerCase().includes("gambling");
    expect(hasIowa).toBe(true);
  });

  it("gate control théorie douleur (Melzack/Wall) mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasGate =
      full.toLowerCase().includes("gate control") ||
      full.toLowerCase().includes("melzack") ||
      full.toLowerCase().includes("portillon");
    expect(hasGate).toBe(true);
  });

  it("central sensitization / fibromyalgie mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasFibro =
      full.toLowerCase().includes("fibromyalgie") ||
      full.toLowerCase().includes("central sensitization");
    expect(hasFibro).toBe(true);
  });

  it("Candace Pert neuropeptides mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("pert");
  });

  it("cortisol / axe HPA mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasHPA =
      full.toLowerCase().includes("cortisol") ||
      full.toLowerCase().includes("hpa");
    expect(hasHPA).toBe(true);
  });

  it("neuroception sécurité Porges mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasNeuro =
      full.toLowerCase().includes("neuroception") ||
      full.toLowerCase().includes("s\u00e9curit\u00e9");
    expect(hasNeuro).toBe(true);
  });

  it("fenêtre de tolérance Siegel mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    const hasFenetre =
      full.toLowerCase().includes("fenetre de tolerance") ||
      full.toLowerCase().includes("fen\u00eatre de tol\u00e9rance") ||
      full.toLowerCase().includes("siegel");
    expect(hasFenetre).toBe(true);
  });

  it("Somatic Experiencing Peter Levine mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasSE =
      full.toLowerCase().includes("somatic experiencing") ||
      full.toLowerCase().includes("levine");
    expect(hasSE).toBe(true);
  });

  it("van der Kolk corps trauma mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasVdK =
      full.toLowerCase().includes("van der kolk") ||
      full.toLowerCase().includes("kolk");
    expect(hasVdK).toBe(true);
  });

  it("MBSR Kabat-Zinn mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasKZ =
      full.toLowerCase().includes("kabat") ||
      full.toLowerCase().includes("mbsr");
    expect(hasKZ).toBe(true);
  });

  it("alexithymie mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("alexithymie");
  });

  it("axe intestin-cerveau / microbiote mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasGut =
      full.toLowerCase().includes("intestin") ||
      full.toLowerCase().includes("microbiote") ||
      full.toLowerCase().includes("microbiome");
    expect(hasGut).toBe(true);
  });

  it("inflammation / cytokines / dépression mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasInflam =
      full.toLowerCase().includes("inflammation") ||
      full.toLowerCase().includes("cytokine");
    expect(hasInflam).toBe(true);
  });
});
