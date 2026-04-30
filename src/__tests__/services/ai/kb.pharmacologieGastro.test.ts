/**
 * Tests KB phase 43 — pharmacologie_clinique_avancee + gastroenterologie_hepatologie
 */
import { describe, it, expect } from 'vitest';
import pharmacologieRaw from '../../../../data/knowledge_base/default/pharmacologie_clinique_avancee.json';
import gastroRaw from '../../../../data/knowledge_base/default/gastroenterologie_hepatologie.json';

// ── Type helpers ─────────────────────────────────────────────────────────────

interface KBJson {
  version: string;
  category: string;
  description: string;
  retrieval_triggers: string[];
  sections: Record<string, Record<string, string>>;
}

const pharmacologie = pharmacologieRaw as unknown as KBJson;
const gastro = gastroRaw as unknown as KBJson;

// ── Pharmacologie clinique avancée ───────────────────────────────────────────

describe('pharmacologie_clinique_avancee — structure', () => {
  it('has correct version', () => {
    expect(pharmacologie.version).toBe('31.7.3');
  });

  it('has correct category', () => {
    expect(pharmacologie.category).toBe('pharmacologie_clinique_avancee');
  });

  it('has description', () => {
    expect(pharmacologie.description).toBeTruthy();
    expect(pharmacologie.description.length).toBeGreaterThan(20);
  });

  it('has at least 60 retrieval_triggers', () => {
    expect(pharmacologie.retrieval_triggers.length).toBeGreaterThanOrEqual(60);
  });

  it('has all 6 required sections', () => {
    const sections = Object.keys(pharmacologie.sections);
    expect(sections).toContain('pharmacocinetique_adme');
    expect(sections).toContain('pharmacodynamique_interactions');
    expect(sections).toContain('antibiotiques_antiinfectieux');
    expect(sections).toContain('psychotropes_neurologie');
    expect(sections).toContain('analgesiques_antalgiques');
    expect(sections).toContain('pharmacovigilance_prescriptions');
    expect(sections).toContain('urgences_antidotes');
  });
});

describe('pharmacologie_clinique_avancee — pharmacocinetique_adme', () => {
  const adme = pharmacologie.sections.pharmacocinetique_adme;

  it('mentions ADME', () => {
    expect(adme.principes_fondamentaux).toMatch(/ADME/i);
  });

  it('mentions biodisponibilité and first-pass effect', () => {
    expect(adme.absorption).toMatch(/[Bb]iodisponibilit[eé]/);
    expect(adme.absorption).toMatch(/premier passage/i);
  });

  it('mentions volume de distribution', () => {
    expect(adme.distribution).toMatch(/[Vv]olume de distribution/);
  });

  it('mentions CYP450 in metabolisme', () => {
    expect(adme.metabolisme).toMatch(/CYP/);
  });

  it('mentions half-life and steady state in elimination', () => {
    expect(adme.elimination).toMatch(/demi.?vie/i);
    expect(adme.elimination).toMatch(/[Ee]tat d.[eé]quilibre|steady state/i);
  });
});

describe('pharmacologie_clinique_avancee — interactions', () => {
  const interactions = pharmacologie.sections.pharmacodynamique_interactions;

  it('mentions CYP3A4 inhibitors including pamplemousse', () => {
    expect(interactions.interactions_PK).toMatch(/pamplemousse/i);
  });

  it('mentions rifampicine as inducer', () => {
    expect(interactions.interactions_PK).toMatch(/rifampicine/i);
  });

  it('mentions serotonin syndrome', () => {
    expect(interactions.interactions_PD).toMatch(/torsades|QT/i);
  });

  it('mentions HLA pharmacogenomics', () => {
    expect(interactions.modulation_genetique).toMatch(/HLA/);
  });
});

describe('pharmacologie_clinique_avancee — antibiotiques', () => {
  const abx = pharmacologie.sections.antibiotiques_antiinfectieux;

  it('mentions SARM and BLSE', () => {
    expect(abx.resistances).toMatch(/SARM/);
    expect(abx.resistances).toMatch(/BLSE/);
  });

  it('mentions vancomycin monitoring', () => {
    expect(abx.aminosides_vancomycine).toMatch(/vancomycine/i);
    expect(abx.aminosides_vancomycine).toMatch(/AUC/i);
  });

  it('mentions antifungals (azoles, echinocandins)', () => {
    expect(abx.antifongiques).toMatch(/[Aa]zol[ée]s?|[Ff]luconazole/);
    expect(abx.antifongiques).toMatch(/[Éé]chinocandines?|caspofongine/i);
  });

  it('mentions sofosbuvir for HCV', () => {
    expect(abx.antiviraux).toMatch(/sofosbuvir/i);
  });
});

describe('pharmacologie_clinique_avancee — psychotropes', () => {
  const psy = pharmacologie.sections.psychotropes_neurologie;

  it('mentions serotonin syndrome', () => {
    expect(psy.syndrome_serotonergique).toMatch(/s[eé]rotonin|IMAO|ISRS/i);
  });

  it('mentions lithium therapeutic window', () => {
    expect(psy.thymoregulateurs).toMatch(/lithium/i);
    expect(psy.thymoregulateurs).toMatch(/0[.,][68]|1[.,][02]/);
  });

  it('mentions clozapine NFS monitoring', () => {
    expect(psy.antipsychotiques).toMatch(/clozapine/i);
    expect(psy.antipsychotiques).toMatch(/NFS|agranulocytose/i);
  });

  it('mentions valproate CI in pregnancy', () => {
    expect(psy.thymoregulateurs).toMatch(/valproate|grossesse/i);
  });
});

describe('pharmacologie_clinique_avancee — analgesiques', () => {
  const analg = pharmacologie.sections.analgesiques_antalgiques;

  it('mentions OMS 3 levels', () => {
    expect(analg.paliers_OMS).toMatch(/[Pp]alier/);
    expect(analg.paliers_OMS).toMatch(/[Pp]aracetamol|paracétamol/i);
  });

  it('mentions naloxone', () => {
    expect(analg.antagonistes_semi).toMatch(/naloxone/i);
  });

  it('mentions fentanyl patch', () => {
    expect(analg.opioides).toMatch(/fentanyl/i);
  });
});

describe('pharmacologie_clinique_avancee — pharmacovigilance et urgences', () => {
  const phv = pharmacologie.sections.pharmacovigilance_prescriptions;
  const urg = pharmacologie.sections.urgences_antidotes;

  it('mentions SJS and DRESS', () => {
    expect(phv.reactions_graves).toMatch(/SJS|Stevens.Johnson/i);
    expect(phv.reactions_graves).toMatch(/DRESS/i);
  });

  it('mentions Beers list and STOPP/START', () => {
    expect(phv.prescriptions_speciales).toMatch(/[Bb]eers/);
    expect(phv.prescriptions_speciales).toMatch(/STOPP|START/i);
  });

  it('mentions N-acetylcysteine for paracetamol OD', () => {
    expect(urg.intoxication_paracetamol).toMatch(/N.ac[eé]tylcyst[eé]ine|NAC/i);
  });

  it('mentions flumazenil and naloxone as antidotes', () => {
    expect(urg.autres_antidotes).toMatch(/flumazénil|flumazenil/i);
    expect(urg.autres_antidotes).toMatch(/naloxone/i);
  });

  it('mentions intralipid for LA toxicity', () => {
    expect(urg.anesthesiques_locaux).toMatch(/intralipide|lipidique/i);
  });
});

// ── Gastroentérologie & Hépatologie ─────────────────────────────────────────

describe('gastroenterologie_hepatologie — structure', () => {
  it('has correct version', () => {
    expect(gastro.version).toBe('31.7.4');
  });

  it('has correct category', () => {
    expect(gastro.category).toBe('gastroenterologie_hepatologie');
  });

  it('has at least 55 retrieval_triggers', () => {
    expect(gastro.retrieval_triggers.length).toBeGreaterThanOrEqual(55);
  });

  it('has all 7 required sections', () => {
    const sections = Object.keys(gastro.sections);
    expect(sections).toContain('tube_digestif_motricite');
    expect(sections).toContain('mici_ibd');
    expect(sections).toContain('hepatites_virales');
    expect(sections).toContain('cirrhose_hypertension_portale');
    expect(sections).toContain('pancreas_voies_biliaires');
    expect(sections).toContain('endoscopie_cancer_digestif');
    expect(sections).toContain('foie_non_viral');
  });
});

describe('gastroenterologie_hepatologie — tube_digestif', () => {
  const tube = gastro.sections.tube_digestif_motricite;

  it('mentions IBS Rome IV criteria', () => {
    expect(tube.SII_colon_irritable).toMatch(/Rome IV/i);
  });

  it('mentions FODMAP', () => {
    expect(tube.traitement_SII).toMatch(/FODMAP/i);
  });

  it('mentions SIBO', () => {
    expect(tube.traitement_SII).toMatch(/SIBO/i);
  });

  it('mentions H. pylori in dyspepsia', () => {
    expect(tube.dyspepsie_gastroparesie).toMatch(/pylori/i);
  });
});

describe('gastroenterologie_hepatologie — MICI', () => {
  const mici = gastro.sections.mici_ibd;

  it('mentions Crohn and RCH', () => {
    expect(mici.diagnostic_classification).toMatch(/[Cc]rohn/);
    expect(mici.diagnostic_classification).toMatch(/RCH|[Rr]ectocolite/);
  });

  it('mentions biologics (anti-TNF, vedolizumab, ustekinumab)', () => {
    expect(mici.traitement_MICI).toMatch(/anti.TNF|infliximab/i);
    expect(mici.traitement_MICI).toMatch(/v[eé]dolizumab/i);
    expect(mici.traitement_MICI).toMatch(/ust[eé]kinumab/i);
  });

  it('mentions JAK inhibitors', () => {
    expect(mici.traitement_MICI).toMatch(/JAK|upadacitinib/i);
  });
});

describe('gastroenterologie_hepatologie — hepatites_virales', () => {
  const hep = gastro.sections.hepatites_virales;

  it('mentions HBs antigen and HBV DNA', () => {
    expect(hep.hepatite_B).toMatch(/AgHBs/i);
    expect(hep.hepatite_B).toMatch(/ADN VHB|[Vv]ir[eé]mie/i);
  });

  it('mentions sofosbuvir/velpatasvir for HCV', () => {
    expect(hep.hepatite_C).toMatch(/sofosbuvir/i);
    expect(hep.hepatite_C).toMatch(/velpatasvir/i);
  });

  it('mentions >95% cure rate for HCV AAD', () => {
    expect(hep.hepatite_C).toMatch(/95|98/);
  });
});

describe('gastroenterologie_hepatologie — cirrhose', () => {
  const cirr = gastro.sections.cirrhose_hypertension_portale;

  it('mentions Child-Pugh and MELD', () => {
    expect(cirr.evaluation_severite).toMatch(/Child.Pugh/i);
    expect(cirr.evaluation_severite).toMatch(/MELD/i);
  });

  it('mentions ascite treatment (spironolactone, albumin)', () => {
    expect(cirr.ascite).toMatch(/spironolactone/i);
    expect(cirr.ascite).toMatch(/albumine/i);
  });

  it('mentions hepatic encephalopathy (lactulose, rifaximin)', () => {
    expect(cirr.encephalopathie_hepatique).toMatch(/lactulose/i);
    expect(cirr.encephalopathie_hepatique).toMatch(/rifaximine/i);
  });

  it('mentions HCC surveillance and BCLC staging', () => {
    expect(cirr.complications_varices_CHC).toMatch(/BCLC/i);
    expect(cirr.complications_varices_CHC).toMatch(/sorafénib|sorafenib/i);
  });
});

describe('gastroenterologie_hepatologie — pancreas', () => {
  const panc = gastro.sections.pancreas_voies_biliaires;

  it('mentions Ranson/BISAP severity scores', () => {
    expect(panc.pancreatite_aigue).toMatch(/Ranson/i);
    expect(panc.pancreatite_aigue).toMatch(/BISAP/i);
  });

  it('mentions ERCP for biliary pancreatitis', () => {
    expect(panc.pancreatite_aigue).toMatch(/CPRE/i);
  });

  it('mentions CBP (anti-mitochondria) and UDCA', () => {
    expect(panc.voies_biliaires).toMatch(/anti.mitochondrie[s]?/i);
    expect(panc.voies_biliaires).toMatch(/AUDC|ursod[eé]soxycholique/i);
  });
});

describe('gastroenterologie_hepatologie — cancer digestif', () => {
  const endo = gastro.sections.endoscopie_cancer_digestif;

  it('mentions Lynch and FAP hereditary syndromes', () => {
    expect(endo.polype_CCR).toMatch(/Lynch|HNPCC/i);
    expect(endo.polype_CCR).toMatch(/FAP/i);
  });

  it('mentions FIT stool test for CRC screening', () => {
    expect(endo.traitement_CCR).toMatch(/FIT/i);
  });

  it('mentions FOLFOX/FOLFIRI', () => {
    expect(endo.traitement_CCR).toMatch(/FOLFOX/i);
    expect(endo.traitement_CCR).toMatch(/FOLFIRI/i);
  });

  it('mentions imatinib for GIST', () => {
    expect(endo.cancer_gastrique_oesophage).toMatch(/imatinib/i);
  });
});

describe('gastroenterologie_hepatologie — foie_non_viral', () => {
  const foie = gastro.sections.foie_non_viral;

  it('mentions NASH/NAFLD and FIB-4', () => {
    expect(foie.NASH_NAFLD).toMatch(/NASH|NAFLD|MASLD/i);
    expect(foie.NASH_NAFLD).toMatch(/FIB.4|FibroScan/i);
  });

  it('mentions hemochromatosis HFE C282Y', () => {
    expect(foie.hemochromatose).toMatch(/C282Y/i);
    expect(foie.hemochromatose).toMatch(/transferrine/i);
  });

  it('mentions Wilson disease ATP7B and ceruloplasmin', () => {
    expect(foie.maladie_wilson).toMatch(/ATP7B/i);
    expect(foie.maladie_wilson).toMatch(/c[eé]ruléoplasmine|ceruloplasmine/i);
  });

  it('mentions autoimmune hepatitis ANA/ASMA', () => {
    expect(foie.hepatite_auto_immune).toMatch(/ANA|ASMA/i);
    expect(foie.hepatite_auto_immune).toMatch(/azathioprine/i);
  });
});
