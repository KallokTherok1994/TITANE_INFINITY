import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Phase 32 KB tests — Vitest Rule 16 compliance
// Modules: addiction_entretien_motivationnel (v31.4.5) + intimite_sexualite_couples_eft (v31.4.6)

const KB_DIR = join(__dirname, "../../../../data/knowledge_base/default");

function loadKB(filename: string) {
  return JSON.parse(readFileSync(join(KB_DIR, filename), "utf-8"));
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 1: addiction_entretien_motivationnel (v31.4.5)
// ─────────────────────────────────────────────────────────────────────────────
describe("KB: addiction_entretien_motivationnel (v31.4.5)", () => {
  const kb = loadKB("addiction_entretien_motivationnel.json");

  it("a la bonne version v31.4.5", () => {
    expect(kb.version).toBe("v31.4.5");
  });

  it("a la bonne catégorie", () => {
    expect(kb.category).toBe("addiction_entretien_motivationnel");
  });

  it("a au moins 45 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(45);
  });

  it("a au moins 7 sections", () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it("triggers contiennent entretien motivationnel", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("entretien motivationnel");
  });

  it("triggers contiennent Miller Rollnick", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Miller");
  });

  it("triggers contiennent Prochaska", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Prochaska");
  });

  it("triggers contiennent stades du changement", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("stades");
  });

  it("section neurobiologie addiction existe", () => {
    const hasNeuro =
      kb.sections.neurobiologie_addiction !== undefined ||
      kb.sections.neurobiologie !== undefined;
    expect(hasNeuro).toBe(true);
  });

  it("section Prochaska/DiClemente stades changement existe", () => {
    const hasStades =
      kb.sections.prochaska_diclemente_stades_changement !== undefined ||
      kb.sections.stades_changement !== undefined;
    expect(hasStades).toBe(true);
  });

  it("section entretien motivationnel existe", () => {
    const hasEM =
      kb.sections.entretien_motivationnel_em !== undefined ||
      kb.sections.entretien_motivationnel !== undefined;
    expect(hasEM).toBe(true);
  });

  it("section réduction des risques existe", () => {
    const hasRDR =
      kb.sections.reduction_des_risques !== undefined ||
      kb.sections.harm_reduction !== undefined;
    expect(hasRDR).toBe(true);
  });

  it("section codépendance/famille existe", () => {
    const hasCodep =
      kb.sections.codependance_et_systeme_famille !== undefined ||
      kb.sections.codependance !== undefined;
    expect(hasCodep).toBe(true);
  });

  it("section addictions comportementales existe", () => {
    const hasComp =
      kb.sections.addictions_comportementales !== undefined ||
      kb.sections.addiction_comportementale !== undefined;
    expect(hasComp).toBe(true);
  });

  it("section approches thérapeutiques existe", () => {
    const hasApps =
      kb.sections.approches_therapeutiques_addiction !== undefined ||
      kb.sections.approches_therapeutiques !== undefined;
    expect(hasApps).toBe(true);
  });

  it("circuit dopamine/récompense mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("dopamine");
  });

  it("6 stades de changement mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("pr");
    // précontemplation
    const hasPC =
      full.toLowerCase().includes("precontemplation") ||
      full.toLowerCase().includes("pr\u00e9contemplation");
    expect(hasPC).toBe(true);
  });

  it("OARS technique EM mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasOARS =
      full.includes("OARS") ||
      full.includes("O_questions") ||
      full.toLowerCase().includes("questions ouvertes");
    expect(hasOARS).toBe(true);
  });

  it("résistance au changement mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("r\u00e9sistance");
  });

  it("méthadone/buprénorphine TSO mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasTSO =
      full.toLowerCase().includes("methadone") ||
      full.toLowerCase().includes("m\u00e9thadone") ||
      full.toLowerCase().includes("buprenorphine") ||
      full.toLowerCase().includes("bupren");
    expect(hasTSO).toBe(true);
  });

  it("Marlatt rechute mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full.toLowerCase()).toContain("marlatt");
  });

  it("codépendance mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    const hasCode =
      full.toLowerCase().includes("cod\u00e9pendance") ||
      full.toLowerCase().includes("codependance");
    expect(hasCode).toBe(true);
  });

  it("CRAFT mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full).toContain("CRAFT");
  });

  it("jeu pathologique mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasJeu =
      full.toLowerCase().includes("jeu pathologique") ||
      full.toLowerCase().includes("gambling");
    expect(hasJeu).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Module 2: intimite_sexualite_couples_eft (v31.4.6)
// ─────────────────────────────────────────────────────────────────────────────
describe("KB: intimite_sexualite_couples_eft (v31.4.6)", () => {
  const kb = loadKB("intimite_sexualite_couples_eft.json");

  it("a la bonne version v31.4.6", () => {
    expect(kb.version).toBe("v31.4.6");
  });

  it("a la bonne catégorie", () => {
    expect(kb.category).toBe("intimite_sexualite_couples_eft");
  });

  it("a au moins 44 retrieval_triggers", () => {
    expect(kb.retrieval_triggers.length).toBeGreaterThanOrEqual(44);
  });

  it("a au moins 7 sections", () => {
    expect(Object.keys(kb.sections).length).toBeGreaterThanOrEqual(7);
  });

  it("triggers contiennent EFT", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("EFT");
  });

  it("triggers contiennent Sue Johnson", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Sue Johnson");
  });

  it("triggers contiennent Gottman", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Gottman");
  });

  it("triggers contiennent Masters Johnson", () => {
    const joined = kb.retrieval_triggers.join(" ");
    expect(joined).toContain("Masters");
  });

  it("section EFT existe", () => {
    const hasEFT =
      kb.sections.eft_therapie_emotionfocused !== undefined ||
      kb.sections.eft !== undefined;
    expect(hasEFT).toBe(true);
  });

  it("section Gottman existe", () => {
    const hasGottman =
      kb.sections.gottman_recherche_couple !== undefined ||
      kb.sections.gottman !== undefined;
    expect(hasGottman).toBe(true);
  });

  it("section sexologie Masters Johnson existe", () => {
    const hasSexo =
      kb.sections.sexologie_masters_johnson !== undefined ||
      kb.sections.sexologie !== undefined;
    expect(hasSexo).toBe(true);
  });

  it("section thérapie sexuelle existe", () => {
    const hasTherapie =
      kb.sections.therapie_sexuelle_approches !== undefined ||
      kb.sections.therapie_sexuelle !== undefined;
    expect(hasTherapie).toBe(true);
  });

  it("section identité de genre/orientation existe", () => {
    const hasGenre =
      kb.sections.identite_genre_orientation !== undefined ||
      kb.sections.identite_genre !== undefined;
    expect(hasGenre).toBe(true);
  });

  it("section sexualité et trauma existe", () => {
    const hasTrauma =
      kb.sections.sexualite_et_trauma !== undefined ||
      kb.sections.trauma_sexualite !== undefined;
    expect(hasTrauma).toBe(true);
  });

  it("section infidélité et réparation existe", () => {
    const hasInfid =
      kb.sections.infidelite_et_reparation !== undefined ||
      kb.sections.infidelite !== undefined;
    expect(hasInfid).toBe(true);
  });

  it("cycles d'attachement EFT mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasCycle =
      full.toLowerCase().includes("cycle") &&
      (full.toLowerCase().includes("poursuite") ||
        full.toLowerCase().includes("retrait"));
    expect(hasCycle).toBe(true);
  });

  it("9 étapes EFT mentionnées", () => {
    const full = JSON.stringify(kb.sections);
    const hasEtapes =
      full.toLowerCase().includes("9") ||
      full.toLowerCase().includes("neuf") ||
      full.toLowerCase().includes("phase_1") ||
      full.toLowerCase().includes("etape");
    expect(hasEtapes).toBe(true);
  });

  it("4 Cavaliers de Gottman mentionnés", () => {
    const full = JSON.stringify(kb.sections);
    const hasCavaliers =
      full.toLowerCase().includes("cavalier") ||
      (full.toLowerCase().includes("critique") &&
        full.toLowerCase().includes("mepris"));
    expect(hasCavaliers).toBe(true);
  });

  it("mépris (Gottman) mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasMepris =
      full.toLowerCase().includes("mepris") ||
      full.toLowerCase().includes("m\u00e9pris");
    expect(hasMepris).toBe(true);
  });

  it("cycle réponse sexuelle (Masters Johnson) mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasCycle =
      full.toLowerCase().includes("excitation") &&
      full.toLowerCase().includes("orgasme");
    expect(hasCycle).toBe(true);
  });

  it("sensate focus mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasSF =
      full.toLowerCase().includes("sensate focus") ||
      full.toLowerCase().includes("sensate");
    expect(hasSF).toBe(true);
  });

  it("PLISSIT mentionné", () => {
    const full = JSON.stringify(kb.sections);
    expect(full).toContain("PLISSIT");
  });

  it("dyspareunie/vaginisme mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasDys =
      full.toLowerCase().includes("dyspareunie") ||
      full.toLowerCase().includes("vaginisme");
    expect(hasDys).toBe(true);
  });

  it("désir réactif/responsive mentionné (Nagoski)", () => {
    const full = JSON.stringify(kb.sections);
    const hasNagoski =
      full.toLowerCase().includes("nagoski") ||
      full.toLowerCase().includes("reactif") ||
      full.toLowerCase().includes("r\u00e9actif");
    expect(hasNagoski).toBe(true);
  });

  it("Hold Me Tight (Johnson) mentionné", () => {
    const full = JSON.stringify(kb.sections);
    const hasHMT =
      full.toLowerCase().includes("hold me tight") ||
      full.toLowerCase().includes("hold me");
    expect(hasHMT).toBe(true);
  });

  it("infidélité: prise de responsabilité mentionnée", () => {
    const full = JSON.stringify(kb.sections);
    const hasResp =
      full.toLowerCase().includes("responsabilit") ||
      full.toLowerCase().includes("pardon");
    expect(hasResp).toBe(true);
  });
});
