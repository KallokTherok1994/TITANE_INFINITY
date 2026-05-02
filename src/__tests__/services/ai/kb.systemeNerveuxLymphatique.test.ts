/**
 * Phase 39 — Vitest KB tests
 * systeme_nerveux_neuroanatomie (v31.5.9)
 * systeme_lymphatique_sanguin (v31.5.10)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ── helpers ──────────────────────────────────────────────────────────────────

const KB_DIR = path.resolve(__dirname, '../../../../data/knowledge_base/default');

function loadJson(name: string): Record<string, unknown> {
  const p = path.join(KB_DIR, `${name}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function text(obj: unknown): string {
  return JSON.stringify(obj);
}

// ── fixtures ──────────────────────────────────────────────────────────────────

let snn: Record<string, unknown>;
let sls: Record<string, unknown>;

beforeAll(() => {
  snn = loadJson('systeme_nerveux_neuroanatomie');
  sls = loadJson('systeme_lymphatique_sanguin');
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 1 — Structure systeme_nerveux_neuroanatomie
// ─────────────────────────────────────────────────────────────────────────────

describe('SNN — structure JSON', () => {
  it('has version v31.5.9', () => {
    expect(snn.version).toBe('v31.5.9');
  });
  it('has category systeme_nerveux_neuroanatomie', () => {
    expect(snn.category).toBe('systeme_nerveux_neuroanatomie');
  });
  it('has a non-empty description', () => {
    expect(typeof snn.description).toBe('string');
    expect((snn.description as string).length).toBeGreaterThan(10);
  });
  it('has retrieval_triggers array with >=40 entries', () => {
    expect(Array.isArray(snn.retrieval_triggers)).toBe(true);
    expect((snn.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(40);
  });
  it('has sections object', () => {
    expect(typeof snn.sections).toBe('object');
    expect(snn.sections).not.toBeNull();
  });
  it('has 7 sections', () => {
    expect(Object.keys(snn.sections as object).length).toBe(7);
  });
  it('includes key sections', () => {
    const secs = Object.keys(snn.sections as object);
    expect(secs).toContain('neuroanatomie_centrale');
    expect(secs).toContain('neurotransmetteurs_systemes');
    expect(secs).toContain('potentiel_action_synapse');
    expect(secs).toContain('neuroplasticite_pathologies');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 2 — Contenu core SNN
// ─────────────────────────────────────────────────────────────────────────────

describe('SNN — contenu core neuroanatomie', () => {
  it('contient tronc cérébral et ses structures', () => {
    expect(text(snn)).toMatch(/tronc c[eé]r[eé]bral|[Bb]ulbe/);
    expect(text(snn)).toMatch(/locus coeruleus/);
    expect(text(snn)).toMatch(/[Mm][eé]senc[eé]phale/);
  });
  it('contient cervelet et coordination motrice', () => {
    expect(text(snn)).toMatch(/cervelet/);
    expect(text(snn)).toMatch(/[Pp]urkinje/);
    expect(text(snn)).toMatch(/coordination|ataxie/);
  });
  it('contient thalamus et hypothalamus', () => {
    expect(text(snn)).toMatch(/thalamus/);
    expect(text(snn)).toMatch(/hypothalamus/);
    expect(text(snn)).toMatch(/hom[eé]ostasie|SCN|circadien/);
  });
  it('contient cortex frontal et lobes cérébraux', () => {
    expect(text(snn)).toMatch(/frontal/);
    expect(text(snn)).toMatch(/Broca|Wernicke/);
    expect(text(snn)).toMatch(/hippocampe/);
  });
  it('contient système nerveux autonome sympathique et parasympathique', () => {
    expect(text(snn)).toMatch(/sympathique/);
    expect(text(snn)).toMatch(/parasympathique/);
    expect(text(snn)).toMatch(/fight.or.flight|rest.digest/);
  });
  it('contient système entérique (2e cerveau)', () => {
    expect(text(snn)).toMatch(/ent[eé]rique/);
    expect(text(snn)).toMatch(/Meissner|Auerbach/);
    expect(text(snn)).toMatch(/deuxi[eè]me cerveau|axe cerveau.intestin/);
  });
  it('contient glutamate et GABA', () => {
    expect(text(snn)).toMatch(/glutamate/);
    expect(text(snn)).toMatch(/GABA/);
    expect(text(snn)).toMatch(/NMDA|AMPA/);
  });
  it('contient les 4 voies dopaminergiques', () => {
    expect(text(snn)).toMatch(/dopamine/);
    expect(text(snn)).toMatch(/m[eé]solimbique|m[eé]socorticale|nigro.stri[eé]|tubéro/);
  });
  it('contient sérotonine et noradrénaline', () => {
    expect(text(snn)).toMatch(/s[eé]rotonine/);
    expect(text(snn)).toMatch(/noradr[eé]naline/);
    expect(text(snn)).toMatch(/Raphe|locus coeruleus/);
  });
  it("contient potentiel d'action et myéline", () => {
    expect(text(snn)).toMatch(/potentiel.*(action|repos)|repolarisation/);
    expect(text(snn)).toMatch(/my[eé]line|Ranvier/);
    expect(text(snn)).toMatch(/saltatoire/);
  });
  it('contient synapse chimique et LTP', () => {
    expect(text(snn)).toMatch(/synapse/);
    expect(text(snn)).toMatch(/LTP|LTD/);
    expect(text(snn)).toMatch(/Hebb/);
  });
  it('contient théorie polyvagale de Porges', () => {
    expect(text(snn)).toMatch(/Porges/);
    expect(text(snn)).toMatch(/polyvagal/);
    expect(text(snn)).toMatch(/ventral|dorsal|engagement social/);
  });
  it('contient BHE et LCR', () => {
    expect(text(snn)).toMatch(/BHE|barrière hémato/);
    expect(text(snn)).toMatch(/LCR|liquide c[eé]phalo/);
    expect(text(snn)).toMatch(/tight junctions|astrocytaire/);
  });
  it('contient neuroplasticité et BDNF', () => {
    expect(text(snn)).toMatch(/neuroplasticit/);
    expect(text(snn)).toMatch(/BDNF/);
    expect(text(snn)).toMatch(/neurogenèse adulte|Eriksson/);
  });
  it('contient Alzheimer, Parkinson et SEP', () => {
    expect(text(snn)).toMatch(/Alzheimer/);
    expect(text(snn)).toMatch(/Parkinson/);
    expect(text(snn)).toMatch(/SEP|sclérose en plaques/);
    expect(text(snn)).toMatch([/[eé]pilepsie/][0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 3 — Structure systeme_lymphatique_sanguin
// ─────────────────────────────────────────────────────────────────────────────

describe('SLS — structure JSON', () => {
  it('has version v31.5.10', () => {
    expect(sls.version).toBe('v31.5.10');
  });
  it('has category systeme_lymphatique_sanguin', () => {
    expect(sls.category).toBe('systeme_lymphatique_sanguin');
  });
  it('has a non-empty description', () => {
    expect(typeof sls.description).toBe('string');
    expect((sls.description as string).length).toBeGreaterThan(10);
  });
  it('has retrieval_triggers array with >=40 entries', () => {
    expect(Array.isArray(sls.retrieval_triggers)).toBe(true);
    expect((sls.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(40);
  });
  it('has sections object', () => {
    expect(typeof sls.sections).toBe('object');
    expect(sls.sections).not.toBeNull();
  });
  it('has 7 sections', () => {
    expect(Object.keys(sls.sections as object).length).toBe(7);
  });
  it('includes key sections', () => {
    const secs = Object.keys(sls.sections as object);
    expect(secs).toContain('sang_composition_fonctions');
    expect(secs).toContain('hemostase_coagulation');
    expect(secs).toContain('immunite_innee_adaptative');
    expect(secs).toContain('pathologies_hematologiques');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 4 — Contenu core SLS
// ─────────────────────────────────────────────────────────────────────────────

describe('SLS — contenu core sang et système lymphatique', () => {
  it('contient plasma et composition du sang', () => {
    expect(text(sls)).toMatch(/plasma/);
    expect(text(sls)).toMatch(/albumine/);
    expect(text(sls)).toMatch(/[Hh][eé]matocrite/);
  });
  it('contient érythrocytes et hémoglobine', () => {
    expect(text(sls)).toMatch(/[eé]rythrocytes/);
    expect(text(sls)).toMatch(/h[eé]moglobine/);
    expect(text(sls)).toMatch(/EPO|[eé]rythropoï.tine/);
  });
  it('contient leucocytes (neutrophiles, lymphocytes)', () => {
    expect(text(sls)).toMatch(/leucocytes/);
    expect(text(sls)).toMatch(/neutrophiles/);
    expect(text(sls)).toMatch(/lymphocytes/);
  });
  it('contient plaquettes et hémostase primaire', () => {
    expect(text(sls)).toMatch(/plaquettes/);
    expect(text(sls)).toMatch(/h[eé]mostase/);
    expect(text(sls)).toMatch(/GPIb|vWF/);
  });
  it('contient cascade de coagulation', () => {
    expect(text(sls)).toMatch(/cascade/);
    expect(text(sls)).toMatch(/thrombine/);
    expect(text(sls)).toMatch(/fibrine/);
  });
  it('contient fibrinolyse et D-dimères', () => {
    expect(text(sls)).toMatch(/[Ff]ibrinolyse/);
    expect(text(sls)).toMatch(/D-dim[eè]res/);
    expect(text(sls)).toMatch(/tPA|plasmine/);
  });
  it('contient anticoagulants thérapeutiques', () => {
    expect(text(sls)).toMatch(/h[eé]parine|AVK|warfarine/);
    expect(text(sls)).toMatch(/NACO|dabigatran|rivaroxaban/);
    expect(text(sls)).toMatch(/antithrombine/);
  });
  it('contient système ABO', () => {
    expect(text(sls)).toMatch(/ABO/);
    expect(text(sls)).toMatch(/[Gg]roupe A|[Gg]roupe B|[Gg]roupe O|[Gg]roupe AB/);
    expect(text(sls)).toMatch(/donneur universel|receveur universel/);
  });
  it('contient système Rhésus et maladie hémolytique fœtale', () => {
    expect(text(sls)).toMatch(/Rh[eé]sus/);
    expect(text(sls)).toMatch(/allo-immunisation|anti-D/);
    expect(text(sls)).toMatch(/h[eé]molytique fœtale|MHFN/);
  });
  it('contient vaisseaux et ganglions lymphatiques', () => {
    expect(text(sls)).toMatch(/canal thoracique/);
    expect(text(sls)).toMatch(/ganglions? lymphatiques?/);
    expect(text(sls)).toMatch(/chyle|lacteals/);
  });
  it('contient organes lymphoïdes (thymus, rate, plaques de Peyer)', () => {
    expect(text(sls)).toMatch(/thymus/);
    expect(text(sls)).toMatch(/rate/);
    expect(text(sls)).toMatch(/plaques de Peyer|MALT/);
  });
  it('contient immunité innée (TLR, complément, cytokines)', () => {
    expect(text(sls)).toMatch(/TLR|PAMP/);
    expect(text(sls)).toMatch(/compl[eé]ment/);
    expect(text(sls)).toMatch(/IL-1|TNF|interf[eé]ron/);
  });
  it('contient immunité adaptative (CMH, CD4, CD8)', () => {
    expect(text(sls)).toMatch(/CMH|HLA/);
    expect(text(sls)).toMatch(/CD4|CD8/);
    expect(text(sls)).toMatch(/IgG|IgA|IgM/);
  });
  it('contient VEGF et forces de Starling', () => {
    expect(text(sls)).toMatch(/VEGF/);
    expect(text(sls)).toMatch(/Starling/);
    expect(text(sls)).toMatch(/lymph[oœ]d[eè]me/);
  });
  it('contient anémies et drépanocytose', () => {
    expect(text(sls)).toMatch(/an[eé]mie/);
    expect(text(sls)).toMatch(/dr[eé]panocytose/);
    expect(text(sls)).toMatch(/BCR-ABL|leucémie/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 5 — Cohérence cross-module
// ─────────────────────────────────────────────────────────────────────────────

describe('Cross-module — cohérence phases 39', () => {
  it('SNN et SLS ont des versions différentes', () => {
    expect(snn.version).not.toBe(sls.version);
  });
  it('SNN et SLS ont des catégories différentes', () => {
    expect(snn.category).not.toBe(sls.category);
  });
  it('SNN triggers contiennent système nerveux et neurone', () => {
    const t = snn.retrieval_triggers as string[];
    expect(t.some(x => /système nerveux|neurone/i.test(x))).toBe(true);
  });
  it('SLS triggers contiennent sang et immunité', () => {
    const t = sls.retrieval_triggers as string[];
    expect(t.some(x => /sang/i.test(x))).toBe(true);
    expect(t.some(x => /immunité|système immunitaire/i.test(x))).toBe(true);
  });
  it('SNN et SLS ont chacun 7 sections', () => {
    expect(Object.keys(snn.sections as object).length).toBe(7);
    expect(Object.keys(sls.sections as object).length).toBe(7);
  });
  it('Les deux fichiers sont valides avec toutes les clés obligatoires', () => {
    for (const kb of [snn, sls]) {
      expect(kb).toHaveProperty('version');
      expect(kb).toHaveProperty('category');
      expect(kb).toHaveProperty('description');
      expect(kb).toHaveProperty('retrieval_triggers');
      expect(kb).toHaveProperty('sections');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 6 — Unit core SNN (termes précis par section)
// ─────────────────────────────────────────────────────────────────────────────

describe('SNN — unit core précis', () => {
  it('tronc cérébral dans neuroanatomie_centrale', () => {
    const s = text((snn.sections as Record<string, unknown>)['neuroanatomie_centrale']);
    expect(s).toMatch(/tronc|[Bb]ulbe/);
  });
  it('SNP autonome dans systeme_nerveux_peripherique', () => {
    const s = text(
      (snn.sections as Record<string, unknown>)['systeme_nerveux_peripherique']
    );
    expect(s).toMatch(/sympathique|parasympathique/);
  });
  it('GABA et glutamate dans neurotransmetteurs_systemes', () => {
    const s = text(
      (snn.sections as Record<string, unknown>)['neurotransmetteurs_systemes']
    );
    expect(s).toMatch(/GABA/);
    expect(s).toMatch(/glutamate/);
  });
  it('LTP dans potentiel_action_synapse', () => {
    const s = text((snn.sections as Record<string, unknown>)['potentiel_action_synapse']);
    expect(s).toMatch(/LTP/);
  });
  it('Porges dans systeme_nerveux_autonome_detail', () => {
    const s = text(
      (snn.sections as Record<string, unknown>)['systeme_nerveux_autonome_detail']
    );
    expect(s).toMatch(/Porges/);
  });
  it('BHE dans barriere_hemato_encephalique', () => {
    const s = text(
      (snn.sections as Record<string, unknown>)['barriere_hemato_encephalique']
    );
    expect(s).toMatch(/BHE|tight junctions/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 7 — Unit core SLS (termes précis par section)
// ─────────────────────────────────────────────────────────────────────────────

describe('SLS — unit core précis', () => {
  it('hémoglobine dans sang_composition_fonctions', () => {
    const s = text(
      (sls.sections as Record<string, unknown>)['sang_composition_fonctions']
    );
    expect(s).toMatch(/h[eé]moglobine/);
  });
  it('thrombine dans hemostase_coagulation', () => {
    const s = text((sls.sections as Record<string, unknown>)['hemostase_coagulation']);
    expect(s).toMatch(/thrombine/);
  });
  it('ABO dans groupes_sanguins_transfusion', () => {
    const s = text(
      (sls.sections as Record<string, unknown>)['groupes_sanguins_transfusion']
    );
    expect(s).toMatch(/ABO/);
  });
  it('canal thoracique dans systeme_lymphatique_anatomie', () => {
    const s = text(
      (sls.sections as Record<string, unknown>)['systeme_lymphatique_anatomie']
    );
    expect(s).toMatch(/canal thoracique/);
  });
  it('CMH dans immunite_innee_adaptative', () => {
    const s = text(
      (sls.sections as Record<string, unknown>)['immunite_innee_adaptative']
    );
    expect(s).toMatch(/CMH/);
  });
  it('VEGF dans angiogenese_microcirculation', () => {
    const s = text(
      (sls.sections as Record<string, unknown>)['angiogenese_microcirculation']
    );
    expect(s).toMatch(/VEGF/);
  });
});
