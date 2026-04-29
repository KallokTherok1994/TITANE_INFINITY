/**
 * Tests KB phase 36 — sociologie_economie_politique (v31.5.3) + neurosciences_emotions_decision (v31.5.4)
 * Rule 16 — chaque module KB doit avoir des tests Vitest
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const dataDir = join(process.cwd(), "data/knowledge_base/default");

function loadKb(filename: string): Record<string, unknown> {
  const raw = readFileSync(join(dataDir, filename), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

// ── Suite 1 — sociologie_economie_politique (v31.5.3) ─────────────────────

describe("KB sociologie_economie_politique (v31.5.3)", () => {
  const kb = loadKb("sociologie_economie_politique.json");

  it("version correcte v31.5.3", () => {
    expect(kb.version).toBe("v31.5.3");
  });

  it("category correcte", () => {
    expect(kb.category).toBe("sociologie_economie_politique");
  });

  it("au moins 47 retrieval_triggers", () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(47);
  });

  it("au moins 7 sections", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it("Durkheim anomie et solidarite dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Dd]urkheim/);
    expect(s).toMatch(/[Aa]nomie/);
    expect(s).toMatch(/[Ss]olidarit/);
  });

  it("suicide Durkheim types dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Ss]uicide/);
    expect(s).toMatch(/[Ee]go[iï]ste|[Aa]nomique|[Aa]ltruiste/);
  });

  it("Weber rationalisation et ideaux-types dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Ww]eber/);
    expect(s).toMatch(/[Rr]ationalisation/);
    expect(s).toMatch(/[Ii]d[eé]aux.types|[Ii]d[eé]al.type/);
  });

  it("ethique protestante Weber dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Pp]rotestante/);
    expect(s).toMatch(/[Cc]apitalisme/);
  });

  it("domination charismatique Weber dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Dd]omination/);
    expect(s).toMatch(/[Cc]harismatique/);
  });

  it("Bourdieu habitus et capital dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Bb]ourdieu/);
    expect(s).toMatch(/[Hh]abitus/);
    expect(s).toMatch(/[Cc]apital/);
  });

  it("champs et distinction Bourdieu dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Cc]hamp/);
    expect(s).toMatch(/[Vv]iolence symbolique|[Dd]istinction/);
  });

  it("Marx alienation et ideologie dans sociologie_classique_fondateurs", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_classique_fondateurs);
    expect(s).toMatch(/[Mm]arx/);
    expect(s).toMatch(/[Aa]li[eé]nation/);
    expect(s).toMatch(/[Ii]d[eé]ologie/);
  });

  it("Goffman presentation de soi dans sociologie_interaction_contemporaine", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_interaction_contemporaine);
    expect(s).toMatch(/[Gg]offman/);
    expect(s).toMatch(/[Pp]r[eé]sentation/);
  });

  it("stigmate Goffman dans sociologie_interaction_contemporaine", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_interaction_contemporaine);
    expect(s).toMatch(/[Ss]tigmate/);
  });

  it("Simmel etranger dans sociologie_interaction_contemporaine", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.sociologie_interaction_contemporaine);
    expect(s).toMatch(/[Ss]immel/);
    expect(s).toMatch(/[Ee]tranger|[Éé]tranger/);
  });

  it("Kahneman Tversky heuristiques dans economie_comportementale", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.economie_comportementale);
    expect(s).toMatch(/[Kk]ahneman/);
    expect(s).toMatch(/[Tt]versky/);
    expect(s).toMatch(/[Hh]euristique/);
  });

  it("prospect theory et aversion pertes dans economie_comportementale", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.economie_comportementale);
    expect(s).toMatch(/[Pp]rospect/);
    expect(s).toMatch(/[Aa]version|[Pp]erte/);
  });

  it("nudge Thaler Sunstein dans economie_comportementale", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.economie_comportementale);
    expect(s).toMatch(/[Nn]udge/);
    expect(s).toMatch(/[Tt]haler/);
  });

  it("Rawls voile ignorance dans philosophie_politique", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.philosophie_politique);
    expect(s).toMatch(/[Rr]awls/);
    expect(s).toMatch(/[Vv]oile/);
    expect(s).toMatch(/[Jj]ustice/);
  });

  it("principe de difference et maximin dans philosophie_politique", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.philosophie_politique);
    expect(s).toMatch(/[Dd]iff[eé]rence|maximin/);
  });

  it("Tocqueville ou Habermas dans philosophie_politique", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.philosophie_politique);
    expect(s).toMatch(/[Tt]ocqueville|[Hh]abermas/);
  });

  it("Putnam capital social bonding bridging dans capital_social_reseaux", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.capital_social_reseaux);
    expect(s).toMatch(/[Pp]utnam/);
    expect(s).toMatch(/bonding|bridging/);
  });

  it("Piketty ou inegalites dans economie_travail_plateformes", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.economie_travail_plateformes);
    expect(s).toMatch(/[Pp]iketty|[Ii]n[eé]galit/);
  });

  it("genre et Beauvoir dans epistemologie_genres_intersectionnalite", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.epistemologie_genres_intersectionnalite);
    expect(s).toMatch(/[Bb]eauvoir/);
    expect(s).toMatch(/[Gg]enre/);
  });

  it("intersectionnalite Crenshaw dans epistemologie_genres_intersectionnalite", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.epistemologie_genres_intersectionnalite);
    expect(s).toMatch(/[Cc]renshaw/);
    expect(s).toMatch(/[Ii]ntersectionnalit/);
  });

  it("description non vide", () => {
    expect(typeof kb.description).toBe("string");
    expect((kb.description as string).length).toBeGreaterThan(50);
  });
});

// ── Suite 2 — neurosciences_emotions_decision (v31.5.4) ───────────────────

describe("KB neurosciences_emotions_decision (v31.5.4)", () => {
  const kb = loadKb("neurosciences_emotions_decision.json");

  it("version correcte v31.5.4", () => {
    expect(kb.version).toBe("v31.5.4");
  });

  it("category correcte", () => {
    expect(kb.category).toBe("neurosciences_emotions_decision");
  });

  it("au moins 47 retrieval_triggers", () => {
    expect(Array.isArray(kb.retrieval_triggers)).toBe(true);
    expect((kb.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(47);
  });

  it("au moins 7 sections", () => {
    const sections = kb.sections as Record<string, unknown>;
    expect(Object.keys(sections).length).toBeGreaterThanOrEqual(7);
  });

  it("LeDoux et amygdale dans amygdale_peur_conditionnement", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.amygdale_peur_conditionnement);
    expect(s).toMatch(/[Ll]e[Dd]oux/);
    expect(s).toMatch(/[Aa]mygdale/);
    expect(s).toMatch(/[Pp]eur/);
  });

  it("voie courte et voie longue peur dans amygdale_peur_conditionnement", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.amygdale_peur_conditionnement);
    expect(s).toMatch(/[Vv]oie courte|[Vv]oie longue/);
    expect(s).toMatch(/[Tt]halamus/);
  });

  it("conditionnement pavlovien et extinction dans amygdale_peur_conditionnement", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.amygdale_peur_conditionnement);
    expect(s).toMatch(/[Cc]onditionnement|[Pp]avlov/);
    expect(s).toMatch(/[Ee]xtinction/);
  });

  it("Damasio marqueurs somatiques dans damasio_marqueurs_somatiques", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.damasio_marqueurs_somatiques);
    expect(s).toMatch(/[Dd]amasio/);
    expect(s).toMatch(/[Mm]arqueurs somatiques/);
  });

  it("Iowa Gambling Task dans damasio_marqueurs_somatiques", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.damasio_marqueurs_somatiques);
    expect(s).toMatch(/[Ii]owa/);
    expect(s).toMatch(/[Gg]ambling/);
  });

  it("cortex prefrontal ventromedial dans damasio_marqueurs_somatiques", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.damasio_marqueurs_somatiques);
    expect(s).toMatch(/[Pp]r[eé]frontal|vmPFC/);
  });

  it("Gross et reevaluation cognitive dans regulation_emotionnelle_neurosciences", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.regulation_emotionnelle_neurosciences);
    expect(s).toMatch(/[Gg]ross/);
    expect(s).toMatch(/[Rr][eé][eé]valuation cognitive/);
  });

  it("suppression expressionnelle dans regulation_emotionnelle_neurosciences", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.regulation_emotionnelle_neurosciences);
    expect(s).toMatch(/[Ss]uppression/);
  });

  it("axe HPA cortisol stress dans stress_hpa_neurobiologie", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.stress_hpa_neurobiologie);
    expect(s).toMatch(/HPA/);
    expect(s).toMatch(/[Cc]ortisol/);
  });

  it("stress chronique et hippocampe dans stress_hpa_neurobiologie", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.stress_hpa_neurobiologie);
    expect(s).toMatch(/[Cc]hronique/);
    expect(s).toMatch(/[Hh]ippocampe/);
  });

  it("dopamine et circuit recompense dans circuit_recompense_dopamine", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.circuit_recompense_dopamine);
    expect(s).toMatch(/[Dd]opamine/);
    expect(s).toMatch(/[Rr][eé]compense/);
  });

  it("noyau accumbens et systeme mesolimbique dans circuit_recompense", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.circuit_recompense_dopamine);
    expect(s).toMatch(/[Aa]ccumbens/);
    expect(s).toMatch(/[Mm][eé]solimbique/);
  });

  it("ocytocine confiance dans neurosciences_sociales", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.neurosciences_sociales);
    expect(s).toMatch(/[Oo]cytocine/);
    expect(s).toMatch(/[Cc]onfiance/);
  });

  it("neurones miroirs et empathie dans neurosciences_sociales", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.neurosciences_sociales);
    expect(s).toMatch(/[Mm]iroirs|[Mm]irror/);
    expect(s).toMatch(/[Ee]mpathie/);
  });

  it("LTP et regle de Hebb dans plasticite_memoire_emotion", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.plasticite_memoire_emotion);
    expect(s).toMatch(/LTP/);
    expect(s).toMatch(/[Hh]ebb/);
  });

  it("memoire emotionnelle et reconsolidation dans plasticite_memoire_emotion", () => {
    const sections = kb.sections as Record<string, unknown>;
    const s = JSON.stringify(sections.plasticite_memoire_emotion);
    expect(s).toMatch(/[Rr]econsolidation|[Cc]onsolidation/);
  });

  it("description non vide", () => {
    expect(typeof kb.description).toBe("string");
    expect((kb.description as string).length).toBeGreaterThan(50);
  });

  it("last_updated renseigne", () => {
    expect(typeof kb.last_updated).toBe("string");
    expect((kb.last_updated as string).length).toBeGreaterThan(0);
  });
});
