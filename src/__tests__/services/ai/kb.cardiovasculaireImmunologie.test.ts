/**
 * KB Phase 42 — Tests Vitest
 * systeme_cardiovasculaire_avance (v31.7.1) + immunologie_auto_immunite (v31.7.2)
 * Rule 16 compliant: tests créés dans le même commit que la modification.
 */

import cardioRaw from "../../../../data/knowledge_base/default/systeme_cardiovasculaire_avance.json";
import immunoRaw from "../../../../data/knowledge_base/default/immunologie_auto_immunite.json";

const text = (obj: unknown): string => JSON.stringify(obj);

const cardio = cardioRaw as Record<string, unknown>;
const immuno = immunoRaw as Record<string, unknown>;

// ─── systeme_cardiovasculaire_avance ─────────────────────────────────────────
describe("KB systeme_cardiovasculaire_avance (v31.7.1)", () => {
  it("version v31.7.1", () => {
    expect(cardio.version).toBe("v31.7.1");
  });

  it("contient 7 sections", () => {
    expect(Object.keys(cardio.sections as object)).toHaveLength(7);
  });

  it("a au moins 80 retrieval_triggers", () => {
    expect((cardio.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(80);
  });

  // Anatomie / physiologie
  it("contient Frank-Starling", () => {
    expect(text(cardio)).toMatch(/Frank-Starling/);
  });

  it("contient fraction d'éjection / FEVG", () => {
    expect(text(cardio)).toMatch(/fraction d.[eé]jection|FE\b|FEVG/);
  });

  it("contient SRAA", () => {
    expect(text(cardio)).toMatch(/SRAA/);
  });

  it("contient BNP / ANP", () => {
    expect(text(cardio)).toMatch(/\bBNP\b|\bANP\b/);
  });

  // HTA
  it("contient HTA / hypertension", () => {
    expect(text(cardio)).toMatch(/\bHTA\b|hypertension/i);
  });

  it("contient IEC / ARA2", () => {
    expect(text(cardio)).toMatch(/\bIEC\b|\bARA2\b/);
  });

  it("contient bêtabloquant / bêtabloquants", () => {
    expect(text(cardio)).toMatch(/b[eê]tabloquant/i);
  });

  it("contient HTA résistante / secondaire", () => {
    expect(text(cardio)).toMatch(/HTA r[eé]sistante|HTA secondaire|prim[ae]ire/i);
  });

  // SCA
  it("contient STEMI / NSTEMI", () => {
    expect(text(cardio)).toMatch(/STEMI|NSTEMI/);
  });

  it("contient troponine haute sensibilité", () => {
    expect(text(cardio)).toMatch(/troponine|hs-cTn/i);
  });

  it("contient athérosclérose / plaque", () => {
    expect(text(cardio)).toMatch(/ath[eé]roscl[eé]rose|plaque/i);
  });

  it("contient PCI / thrombolyse / CABG", () => {
    expect(text(cardio)).toMatch(/\bPCI\b|thrombolyse|CABG/);
  });

  it("contient antiplaquettaires / DAPT", () => {
    expect(text(cardio)).toMatch(/antiplaquettaire|DAPT/i);
  });

  // IC
  it("contient HFrEF / HFpEF", () => {
    expect(text(cardio)).toMatch(/HFrEF|HFpEF/);
  });

  it("contient NT-proBNP", () => {
    expect(text(cardio)).toMatch(/NT-proBNP/);
  });

  it("contient NYHA", () => {
    expect(text(cardio)).toMatch(/NYHA/);
  });

  it("contient SGLT2i", () => {
    expect(text(cardio)).toMatch(/SGLT2/);
  });

  it("contient ARNI / sacubitril", () => {
    expect(text(cardio)).toMatch(/ARNI|sacubitril/i);
  });

  it("contient cardiomyopathie dilatée / hypertrophique", () => {
    expect(text(cardio)).toMatch(/cardiomyopathie dilat[eé]e|cardiomyopathie hypertrophique/i);
  });

  // Arythmies
  it("contient fibrillation auriculaire / FA", () => {
    expect(text(cardio)).toMatch(/fibrillation auriculaire|\bFA\b/);
  });

  it("contient CHA2DS2-VASc", () => {
    expect(text(cardio)).toMatch(/CHA2DS2/);
  });

  it("contient AOD / AVK", () => {
    expect(text(cardio)).toMatch(/\bAOD\b|\bAVK\b/);
  });

  it("contient QT long / torsade de pointes", () => {
    expect(text(cardio)).toMatch(/QT long|torsade de pointes/i);
  });

  it("contient BAV / stimulateur cardiaque", () => {
    expect(text(cardio)).toMatch(/\bBAV\b|stimulateur cardiaque/i);
  });

  it("contient WPW / Wolf Parkinson White", () => {
    expect(text(cardio)).toMatch(/WPW|Wolff.Parkinson/i);
  });

  // Valvulopathies / TEV
  it("contient rétrécissement aortique / TAVI", () => {
    expect(text(cardio)).toMatch(/r[eé]tr[eé]cissement aortique|TAVI/i);
  });

  it("contient embolie pulmonaire / Wells", () => {
    expect(text(cardio)).toMatch(/embolie pulmonaire/i);
  });

  it("contient score Wells EP / D-dimères", () => {
    expect(text(cardio)).toMatch(/Wells|D-dim[eè]re/i);
  });

  it("contient rivaroxaban / apixaban", () => {
    expect(text(cardio)).toMatch(/rivaroxaban|apixaban/i);
  });

  // Biomarqueurs / ECG
  it("contient ECG / onde P / QRS / ST", () => {
    expect(text(cardio)).toMatch(/\bECG\b|onde P|complexe QRS|segment ST/i);
  });

  it("contient LDL-C objectifs", () => {
    expect(text(cardio)).toMatch(/LDL-C/);
  });

  it("contient statines haute intensité", () => {
    expect(text(cardio)).toMatch(/statines? haute intensit[eé]|rosuvastatine|atorvastatine/i);
  });

  it("contient PCSK9 / inhibiteurs", () => {
    expect(text(cardio)).toMatch(/PCSK9/);
  });

  it("contient ézetimibe / NPC1L1", () => {
    expect(text(cardio)).toMatch(/[eé]z[eé]timibe|NPC1L1/i);
  });

  it("contient warfarine / anticoagulant", () => {
    expect(text(cardio)).toMatch(/warfarine|anticoagul/i);
  });

  it("category est systeme_cardiovasculaire_avance", () => {
    expect(cardio.category).toBe("systeme_cardiovasculaire_avance");
  });
});

// ─── immunologie_auto_immunite ────────────────────────────────────────────────
describe("KB immunologie_auto_immunite (v31.7.2)", () => {
  it("version v31.7.2", () => {
    expect(immuno.version).toBe("v31.7.2");
  });

  it("contient 7 sections", () => {
    expect(Object.keys(immuno.sections as object)).toHaveLength(7);
  });

  it("a au moins 110 retrieval_triggers", () => {
    expect((immuno.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(110);
  });

  // Immunité innée / adaptative
  it("contient PAMP / DAMP / TLR", () => {
    expect(text(immuno)).toMatch(/PAMP|DAMP|\bTLR\b/);
  });

  it("contient NLRP3 inflammasome", () => {
    expect(text(immuno)).toMatch(/NLRP3/);
  });

  it("contient NK / macrophage / neutrophile", () => {
    expect(text(immuno)).toMatch(/\bNK\b|macrophage|neutrophile/i);
  });

  it("contient complément / C3a / C5a / MAC", () => {
    expect(text(immuno)).toMatch(/compl[eé]ment|C3a|C5a|\bMAC\b/i);
  });

  it("contient lymphocyte T CD4 / CD8 / Treg", () => {
    expect(text(immuno)).toMatch(/CD4|CD8|\bTreg\b/);
  });

  it("contient Th1 / Th2 / Th17", () => {
    expect(text(immuno)).toMatch(/Th1|Th2|Th17/);
  });

  it("contient IgG / IgA / IgM / IgE", () => {
    expect(text(immuno)).toMatch(/IgG|IgA|IgM|IgE/);
  });

  it("contient commutation isotypique / centre germinatif", () => {
    expect(text(immuno)).toMatch(/commutation isotypique|centre germinatif/i);
  });

  // Cytokines
  it("contient TNFα / IL-6 / IL-17", () => {
    expect(text(immuno)).toMatch(/TNF|IL-6|IL-17/);
  });

  it("contient NF-κB", () => {
    expect(text(immuno)).toMatch(/NF-[κk]B/);
  });

  it("contient JAK/STAT", () => {
    expect(text(immuno)).toMatch(/JAK.STAT|\bJAK\b|\bSTAT\b/);
  });

  it("contient CRP / ferritine / PCT", () => {
    expect(text(immuno)).toMatch(/\bCRP\b|ferritine|\bPCT\b/i);
  });

  it("contient résolvines / lipoxines", () => {
    expect(text(immuno)).toMatch(/r[eé]solvines?|lipoxines?/i);
  });

  // Maladies auto-immunes
  it("contient lupus / LES / ANA / anti-dsDNA", () => {
    expect(text(immuno)).toMatch(/lupus|\bLES\b|\bANA\b|anti-dsDNA/i);
  });

  it("contient SLICC / SLEDAI", () => {
    expect(text(immuno)).toMatch(/SLICC|SLEDAI/);
  });

  it("contient syndrome antiphospholipides / SAPL", () => {
    expect(text(immuno)).toMatch(/antiphospholipide|SAPL/i);
  });

  it("contient polyarthrite rhumatoïde / anti-CCP", () => {
    expect(text(immuno)).toMatch(/polyarthrite rhumato[iï]de|anti-CCP/i);
  });

  it("contient méthotrexate / DMARD", () => {
    expect(text(immuno)).toMatch(/m[eé]thotrexate|DMARD/i);
  });

  it("contient SEP / sclérose en plaques", () => {
    expect(text(immuno)).toMatch(/scl[eé]rose en plaques|\bSEP\b/i);
  });

  it("contient bandes oligoclonales / IRM", () => {
    expect(text(immuno)).toMatch(/bandes oligoclonales|IRM/i);
  });

  it("contient Hashimoto / anti-TPO", () => {
    expect(text(immuno)).toMatch(/Hashimoto|anti-TPO/i);
  });

  it("contient Basedow / TRAb / TSH-R", () => {
    expect(text(immuno)).toMatch(/Basedow|TRAb|TSH-R/i);
  });

  // Biothérapies
  it("contient anti-TNF / infliximab / adalimumab", () => {
    expect(text(immuno)).toMatch(/anti-TNF|infliximab|adalimumab/i);
  });

  it("contient tocilizumab / anti-IL-6", () => {
    expect(text(immuno)).toMatch(/tocilizumab|anti-IL-6/i);
  });

  it("contient sécukinumab / anti-IL-17", () => {
    expect(text(immuno)).toMatch(/s[eé]cukinumab|anti-IL-17/i);
  });

  it("contient tofacitinib / baricitinib / inhibiteur JAK", () => {
    expect(text(immuno)).toMatch(/tofacitinib|baricitinib/i);
  });

  it("contient rituximab / anti-CD20", () => {
    expect(text(immuno)).toMatch(/rituximab|anti-CD20/i);
  });

  it("contient dupilumab / omalizumab", () => {
    expect(text(immuno)).toMatch(/dupilumab|omalizumab/i);
  });

  it("contient corticoïdes / NF-κB transrépression", () => {
    expect(text(immuno)).toMatch(/cortico[iï]des?|transr[eé]pression/i);
  });

  // Allergie / hypersensibilité
  it("contient Gell et Coombs type I-IV", () => {
    expect(text(immuno)).toMatch(/Gell|Coombs/i);
  });

  it("contient anaphylaxie / adrénaline / épinéphrine", () => {
    expect(text(immuno)).toMatch(/anaphylaxie|adr[eé]naline|[eé]pin[eé]phrine/i);
  });

  it("contient rhinite allergique / acariens", () => {
    expect(text(immuno)).toMatch(/rhinite allergique|acariens/i);
  });

  it("contient désensibilisation / SLIT / SCIT", () => {
    expect(text(immuno)).toMatch(/d[eé]sensibilisation|SLIT|SCIT/i);
  });

  it("contient mépolizumab / bénralizumab (anti-IL-5)", () => {
    expect(text(immuno)).toMatch(/m[eé]polizumab|b[eé]nralizumab/i);
  });

  // Immunodéficiences
  it("contient DICV / agammaglobulinémie de Bruton", () => {
    expect(text(immuno)).toMatch(/DICV|agammaglobulin[eé]mie|Bruton/i);
  });

  it("contient DICS / RAG / HSCT", () => {
    expect(text(immuno)).toMatch(/DICS|\bRAG\b|HSCT/i);
  });

  it("contient syndrome hyper-IgM / CD40L", () => {
    expect(text(immuno)).toMatch(/hyper-IgM|CD40L?/i);
  });

  it("contient VIH / SIDA / CD4 count", () => {
    expect(text(immuno)).toMatch(/\bVIH\b|\bSIDA\b|\bHIV\b/i);
  });

  it("contient ARV / dolutégravir / PrEP", () => {
    expect(text(immuno)).toMatch(/ARV|dolutégravir|dolutegravir|PrEP/i);
  });

  it("contient GvHD / rejet de greffe", () => {
    expect(text(immuno)).toMatch(/GvHD|rejet/i);
  });

  it("contient angioœdème héréditaire / C1-inhibiteur", () => {
    expect(text(immuno)).toMatch(/angio[oœ][eè]d[eè]me|C1-inhibiteur/i);
  });

  // Immuno-oncologie
  it("contient immunoediting / élimination / équilibre / échappement", () => {
    expect(text(immuno)).toMatch(/immunoediting|[eé]chappement/i);
  });

  it("contient PD-1 / PD-L1 / CTLA-4", () => {
    expect(text(immuno)).toMatch(/PD-1|PD-L1|CTLA-4/);
  });

  it("contient pembrolizumab / nivolumab / ipilimumab", () => {
    expect(text(immuno)).toMatch(/pembrolizumab|nivolumab|ipilimumab/i);
  });

  it("contient effets indésirables immuno-médiés / irAE", () => {
    expect(text(immuno)).toMatch(/irAE|immuno-m[eé]di[eé]s?/i);
  });

  it("contient TMB / MSI-H / dMMR", () => {
    expect(text(immuno)).toMatch(/TMB|MSI-H|dMMR/);
  });

  it("contient CAR-T / anti-CD19", () => {
    expect(text(immuno)).toMatch(/CAR-T|anti-CD19/i);
  });

  it("contient BiTE / blinatumomab", () => {
    expect(text(immuno)).toMatch(/BiTE|blinatumomab/i);
  });

  it("contient MDSC / TME / microenvironnement tumoral", () => {
    expect(text(immuno)).toMatch(/MDSC|TME|microenvironnement/i);
  });

  it("category est immunologie_auto_immunite", () => {
    expect(immuno.category).toBe("immunologie_auto_immunite");
  });
});
