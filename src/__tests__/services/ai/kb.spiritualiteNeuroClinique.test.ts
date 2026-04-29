/**
 * KB Phase 41 — Tests Vitest
 * spiritualite_sens_existentiel (v31.6.1) + neurosciences_cliniques_avancees (v31.6.2)
 * Rule 16 compliant: tests créés dans le même commit que la modification.
 */

import sseRaw from "../../../../data/knowledge_base/default/spiritualite_sens_existentiel.json";
import ncaRaw from "../../../../data/knowledge_base/default/neurosciences_cliniques_avancees.json";

const text = (obj: unknown): string => JSON.stringify(obj);

const sse = sseRaw as Record<string, unknown>;
const nca = ncaRaw as Record<string, unknown>;

// ─── spiritualite_sens_existentiel ───────────────────────────────────────────
describe("KB spiritualite_sens_existentiel (v31.6.1)", () => {
  it("version v31.6.1", () => {
    expect(sse.version).toBe("v31.6.1");
  });

  it("contient 7 sections", () => {
    expect(Object.keys(sse.sections as object)).toHaveLength(7);
  });

  it("a au moins 48 retrieval_triggers", () => {
    expect((sse.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(48);
  });

  // Logothérapie Frankl
  it("contient Frankl logothérapie", () => {
    expect(text(sse)).toMatch(/Frankl/);
  });
  it("contient will to meaning / vide existentiel", () => {
    expect(text(sse)).toMatch(/will to meaning|vide existentiel/);
  });
  it("contient Man's Search for Meaning", () => {
    expect(text(sse)).toMatch(/Man.s Search for Meaning/);
  });
  it("contient les 3 voies vers le sens", () => {
    expect(text(sse)).toMatch(/[Vv]aleurs cr[eé]atives|[Vv]aleurs exp[eé]rientielles|[Vv]aleurs d.attitude/);
  });
  it("contient intention paradoxale et déréflexion", () => {
    expect(text(sse)).toMatch(/intention paradoxale|d[eé]r[eé]flexion/);
  });
  it("contient PIL (Purpose in Life Test)", () => {
    expect(text(sse)).toMatch(/PIL|Purpose in Life/);
  });

  // Jung
  it("contient Jung inconscient collectif archétypes", () => {
    expect(text(sse)).toMatch(/Jung/);
  });
  it("contient archétypes (Anima, Animus, Ombre, Soi)", () => {
    expect(text(sse)).toMatch(/[Aa]rch[eé]types|Anima|Animus/);
  });
  it("contient Ombre et individuation", () => {
    expect(text(sse)).toMatch(/[Oo]mbre/);
    expect(text(sse)).toMatch(/individuation/);
  });
  it("contient synchronicité Jung & Pauli", () => {
    expect(text(sse)).toMatch(/synchronicit[eé]/);
  });

  // Maslow transcendance
  it("contient Maslow transcendance 8e niveau", () => {
    expect(text(sse)).toMatch(/Maslow/);
    expect(text(sse)).toMatch(/transcendance|transcendence/);
  });
  it("contient Peak experiences", () => {
    expect(text(sse)).toMatch(/[Pp]eak experience/);
  });
  it("contient B-values / métavaleurs", () => {
    expect(text(sse)).toMatch(/[Mm][eé]tavaleurs|B-values/);
  });
  it("contient D-needs et B-needs", () => {
    expect(text(sse)).toMatch(/D-needs|B-needs/);
  });

  // Stoïcisme / Philosophie
  it("contient stoïcisme Épictète Marc Aurèle Sénèque", () => {
    expect(text(sse)).toMatch(/[Ss]to[iï]cisme/);
    expect(text(sse)).toMatch(/[Éé]pict[eè]te/);
  });
  it("contient amor fati Nietzsche", () => {
    expect(text(sse)).toMatch(/[Aa]mor fati/);
  });
  it("contient memento mori", () => {
    expect(text(sse)).toMatch(/[Mm]emento mori/);
  });
  it("contient préméditation des maux", () => {
    expect(text(sse)).toMatch(/premeditatio|pr[eé]m[eé]ditation/);
  });
  it("contient angoisse ontologique Tillich", () => {
    expect(text(sse)).toMatch(/Tillich/);
  });
  it("contient authenticité Heidegger être-vers-la-mort", () => {
    expect(text(sse)).toMatch(/Heidegger/);
    expect(text(sse)).toMatch(/authenticit[eé]|[aA]uth[eé]ntique/);
  });

  // Psychologie transpersonnelle
  it("contient Grof holotropic breathwork", () => {
    expect(text(sse)).toMatch(/Grof/);
    expect(text(sse)).toMatch(/[Hh]olotropic/);
  });
  it("contient Wilber AQAL Integral Theory", () => {
    expect(text(sse)).toMatch(/Wilber/);
    expect(text(sse)).toMatch(/AQAL|Integral Theory/);
  });
  it("contient neurosciences contemplatives Davidson", () => {
    expect(text(sse)).toMatch(/Davidson/);
  });
  it("contient pratiques bouddhistes Samatha Vipassana Mettā", () => {
    expect(text(sse)).toMatch(/Samatha|Vipassana|Mett[aā]/);
  });
  it("contient quatre nobles vérités", () => {
    expect(text(sse)).toMatch(/quatre nobles|dukkha|nirodha/);
  });
  it("contient anatta non-soi Metzinger Damasio", () => {
    expect(text(sse)).toMatch(/Metzinger|Damasio|anatta/);
  });

  // Thérapie existentielle / mort
  it("contient Yalom 4 préoccupations ultimes", () => {
    expect(text(sse)).toMatch(/Yalom/);
  });
  it("contient terror management theory", () => {
    expect(text(sse)).toMatch(/[Tt]error management/);
  });
  it("contient Greenberg Solomon Pyszczynski", () => {
    expect(text(sse)).toMatch(/Greenberg|Solomon|Pyszczynski/);
  });
  it("contient bypass spirituel Welwood", () => {
    expect(text(sse)).toMatch(/bypass spirituel|Welwood/);
  });

  // Mort / deuil / rituels
  it("contient Kübler-Ross 5 stades", () => {
    expect(text(sse)).toMatch(/K[uü]bler-Ross/);
  });
  it("contient Van Gennep rites de passage", () => {
    expect(text(sse)).toMatch(/Van Gennep/);
  });
  it("contient deuil compliqué prolonged grief disorder DSM-5", () => {
    expect(text(sse)).toMatch(/deuil compliqu[eé]|prolonged grief/);
  });
  it("contient dignothérapie Chochinov", () => {
    expect(text(sse)).toMatch(/Chochinov/);
  });
  it("contient Dual Process Model Stroebe Schut", () => {
    expect(text(sse)).toMatch(/Stroebe|Schut|Dual Process Model/);
  });
  it("contient Pargament religious coping", () => {
    expect(text(sse)).toMatch(/Pargament/);
  });
});

// ─── neurosciences_cliniques_avancees ────────────────────────────────────────
describe("KB neurosciences_cliniques_avancees (v31.6.2)", () => {
  it("version v31.6.2", () => {
    expect(nca.version).toBe("v31.6.2");
  });

  it("contient 7 sections", () => {
    expect(Object.keys(nca.sections as object)).toHaveLength(7);
  });

  it("a au moins 40 retrieval_triggers", () => {
    expect((nca.retrieval_triggers as unknown[]).length).toBeGreaterThanOrEqual(40);
  });

  // Sommeil / insomnie
  it("contient insomnie chronique DSM-5/ICSD-3", () => {
    expect(text(nca)).toMatch(/insomnie chronique|insomnie/);
  });
  it("contient TCC-I traitement 1re ligne", () => {
    expect(text(nca)).toMatch(/TCC-I/);
  });
  it("contient restriction du sommeil contrôle du stimulus", () => {
    expect(text(nca)).toMatch(/restriction du sommeil|contr[oô]le du stimulus/);
  });

  // Narcolepsie / parasomnies
  it("contient narcolepsie cataplexie hypocrétine orexine", () => {
    expect(text(nca)).toMatch(/narcolepsie/);
    expect(text(nca)).toMatch(/cataplexie|cataplexia/);
    expect(text(nca)).toMatch(/hypocr[eé]tine|orexine/);
  });
  it("contient modafinil pitolisant oxybate", () => {
    expect(text(nca)).toMatch(/modafinil|pitolisant/);
  });
  it("contient SAS CPAP IAH apnées", () => {
    expect(text(nca)).toMatch(/SAS|CPAP/);
    expect(text(nca)).toMatch(/IAH/);
  });
  it("contient syndrome jambes sans repos dopamine/fer", () => {
    expect(text(nca)).toMatch(/jambes sans repos|RLS/);
    expect(text(nca)).toMatch(/dopamine.{0,20}fer|fer.{0,20}dopamine/);
  });

  // Chronobiologie
  it("contient SCN noyau suprachiasmatique mélatonine", () => {
    expect(text(nca)).toMatch(/SCN|Noyau suprachiasmatique/);
    expect(text(nca)).toMatch(/m[eé]latonine/);
  });
  it("contient gènes circadiens CLOCK BMAL1 PER CRY", () => {
    expect(text(nca)).toMatch(/CLOCK|BMAL1|PER/);
  });
  it("contient mélanopsine ipRGC", () => {
    expect(text(nca)).toMatch(/m[eé]lanopsine/);
  });
  it("contient DSWPD trouble de phase retardée", () => {
    expect(text(nca)).toMatch(/DSWPD/);
  });
  it("contient jet lag photothérapie mélatonine 0,5mg", () => {
    expect(text(nca)).toMatch(/[Jj]et.{0,2}lag/);
    expect(text(nca)).toMatch(/phototh[eé]rapie/);
  });

  // Céphalées / migraines
  it("contient migraine CSD cortical spreading depression", () => {
    expect(text(nca)).toMatch(/CSD|cortical spreading depression/);
  });
  it("contient CGRP calcitonin gene-related peptide", () => {
    expect(text(nca)).toMatch(/CGRP/);
  });
  it("contient triptans 5-HT1B/1D", () => {
    expect(text(nca)).toMatch(/triptan/);
  });
  it("contient anti-CGRP monoclonaux (érenumab, fremanezumab)", () => {
    expect(text(nca)).toMatch(/[eé]renumab|fremanezumab|galcanezumab/);
  });
  it("contient céphalée en grappe cluster signes autonomiques", () => {
    expect(text(nca)).toMatch(/[Cc]ephalée en grappe|[Cc]luster/);
  });
  it("contient CAM céphalée par abus médicamenteux", () => {
    expect(text(nca)).toMatch(/CAM|abus m[eé]dicamenteux/);
  });

  // Vertiges
  it("contient VPPB canal semi-circulaire otoconies", () => {
    expect(text(nca)).toMatch(/VPPB/);
    expect(text(nca)).toMatch(/otoconies/);
  });
  it("contient manœuvre Dix-Hallpike et Epley", () => {
    expect(text(nca)).toMatch(/Dix-Hallpike/);
    expect(text(nca)).toMatch(/Epley/);
  });
  it("contient névrite vestibulaire rééducation", () => {
    expect(text(nca)).toMatch(/n[eé]vrite vestibulaire/);
  });
  it("contient maladie de Ménière hydrops endolymphatique", () => {
    expect(text(nca)).toMatch(/M[eé]ni[eè]re/);
    expect(text(nca)).toMatch(/hydrops endolymphatique/);
  });

  // Douleur neuropathique
  it("contient douleur neuropathique IASP allodynie hyperalgésie", () => {
    expect(text(nca)).toMatch(/IASP/);
    expect(text(nca)).toMatch(/allodynie/);
    expect(text(nca)).toMatch(/hyperal[gG][eé]sie|hyperal[gG][eé]sia/);
  });
  it("contient Nav1.7/Nav1.8 sensibilisation périphérique", () => {
    expect(text(nca)).toMatch(/Nav1\.[78]/);
  });
  it("contient gabapentine prégabaline duloxétine", () => {
    expect(text(nca)).toMatch(/gabapentine|pr[eé]gabaline/);
    expect(text(nca)).toMatch(/dulox[eé]tine/);
  });
  it("contient fibromyalgie sensibilisation centrale WPI SSS ACR", () => {
    expect(text(nca)).toMatch(/fibromyalgie/);
    expect(text(nca)).toMatch(/WPI|ACR 2010/);
  });

  // Neuromodulation
  it("contient DBS STN Parkinson GPi", () => {
    expect(text(nca)).toMatch(/DBS/);
    expect(text(nca)).toMatch(/STN|subthalamic nucleus/);
  });
  it("contient TMS rTMS dépression majeure CPFdl", () => {
    expect(text(nca)).toMatch(/TMS|rTMS/);
    expect(text(nca)).toMatch(/d[eé]pression majeure|CPFDL/);
  });
  it("contient tDCS anodique/cathodique", () => {
    expect(text(nca)).toMatch(/tDCS/);
    expect(text(nca)).toMatch(/anodique|cathodique/);
  });
  it("contient TENS gate control endorphines", () => {
    expect(text(nca)).toMatch(/TENS/);
    expect(text(nca)).toMatch(/gate control/);
  });
  it("contient neurofeedback EEG theta/beta", () => {
    expect(text(nca)).toMatch(/[Nn]eurofeedback/);
  });

  // FND / évaluation
  it("contient FND troubles fonctionnels neurologiques Hoover sign", () => {
    expect(text(nca)).toMatch(/FND/);
    expect(text(nca)).toMatch(/Hoover/);
  });
  it("contient IRM fonctionnelle amygdale CPF FND", () => {
    expect(text(nca)).toMatch(/amygdale/);
  });
  it("contient MoCA MMSE Trail Making Test", () => {
    expect(text(nca)).toMatch(/MoCA/);
    expect(text(nca)).toMatch(/MMSE/);
  });
  it("contient NfL neurofilaments légers biomarqueurs", () => {
    expect(text(nca)).toMatch(/NfL/);
  });
  it("contient default mode network IRMf repos", () => {
    expect(text(nca)).toMatch(/default mode network/);
  });
});
