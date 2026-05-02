/**
 * Phase 38 — Vitest KB tests
 * creativite_apprentissage_cerveau (v31.5.7)
 * relations_amoureuses_attachment_couples (v31.5.8)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ── helpers ──────────────────────────────────────────────────────────────────

const KB_DIR = path.resolve(__dirname, '../../../../data/knowledge_base/default');

function loadJson(name: string): Record<string, unknown> {
  const p = path.join(KB_DIR, `${name}.json`);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

function text(obj: unknown): string {
  return JSON.stringify(obj);
}

// ── fixtures ──────────────────────────────────────────────────────────────────

let clb: Record<string, unknown>;
let rac: Record<string, unknown>;

beforeAll(() => {
  clb = loadJson('creativite_apprentissage_cerveau');
  rac = loadJson('relations_amoureuses_attachment_couples');
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 1 — Structure creativite_apprentissage_cerveau
// ─────────────────────────────────────────────────────────────────────────────

describe('CLB — structure JSON', () => {
  it('has version v31.5.7', () => {
    expect(clb.version).toBe('v31.5.7');
  });
  it('has category creativite_apprentissage_cerveau', () => {
    expect(clb.category).toBe('creativite_apprentissage_cerveau');
  });
  it('has a non-empty description', () => {
    expect(typeof clb.description).toBe('string');
    expect((clb.description as string).length).toBeGreaterThan(10);
  });
  it('has retrieval_triggers array with >=40 entries', () => {
    expect(Array.isArray(clb.retrieval_triggers)).toBe(true);
    expect((clb.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(40);
  });
  it('has sections object', () => {
    expect(typeof clb.sections).toBe('object');
    expect(clb.sections).not.toBeNull();
  });
  it('has 7 sections', () => {
    expect(Object.keys(clb.sections as object).length).toBe(7);
  });
  it('includes key sections', () => {
    const secs = Object.keys(clb.sections as object);
    expect(secs).toContain('creativite_processus');
    expect(secs).toContain('memoire_strategies_optimales');
    expect(secs).toContain('metacognition_autoregulation');
    expect(secs).toContain('neurosciences_apprentissage');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 2 — Contenu core CLB
// ─────────────────────────────────────────────────────────────────────────────

describe('CLB — contenu core créativité et apprentissage', () => {
  it('contient Wallas et les 4 stades du processus créatif', () => {
    expect(text(clb)).toMatch(/Wallas/);
    expect(text(clb)).toMatch(/[Ii]ncubation/);
    expect(text(clb)).toMatch(/[Ii]llumination|Eurêka|Eur.ka/);
  });
  it('contient pensée divergente (Guilford)', () => {
    expect(text(clb)).toMatch(/[Gg]uilford/);
    expect(text(clb)).toMatch(/divergente/);
    expect(text(clb)).toMatch(/fluidit/);
  });
  it('contient flow et Csikszentmihalyi', () => {
    expect(text(clb)).toMatch(/Csikszentmihalyi/);
    expect(text(clb)).toMatch(/flow/i);
    expect(text(clb)).toMatch(/[Hh]ypofrontalit/);
  });
  it('contient Design Thinking et De Bono', () => {
    expect(text(clb)).toMatch(/Design Thinking/);
    expect(text(clb)).toMatch(/De Bono/);
    expect(text(clb)).toMatch(/SCAMPER/);
  });
  it('contient Kolb et le cycle expérientiel', () => {
    expect(text(clb)).toMatch(/Kolb/);
    expect(text(clb)).toMatch(/[Ee]xp.rientiel|exp.rience concrète/);
    expect(text(clb)).toMatch(/divergent|assimilateur|convergent|accommodateur/);
  });
  it('contient Vygotsky et ZPD', () => {
    expect(text(clb)).toMatch(/Vygotsky/);
    expect(text(clb)).toMatch(/ZPD|[Pp]roximal/);
    expect(text(clb)).toMatch(/[Éé]tayage|Scaffolding/);
  });
  it('contient Bloom et taxonomie', () => {
    expect(text(clb)).toMatch(/Bloom/);
    expect(text(clb)).toMatch(/Anderson/);
    expect(text(clb)).toMatch(/[Mm]émoriser|[Cc]réer/);
  });
  it("contient Ebbinghaus et courbe d'oubli", () => {
    expect(text(clb)).toMatch(/Ebbinghaus/);
    expect(text(clb)).toMatch(/oubli/);
    expect(text(clb)).toMatch(/répétition espacée|spaced repetition|Anki/);
  });
  it('contient interleaving et dual coding', () => {
    expect(text(clb)).toMatch(/[Ii]nterleaving/);
    expect(text(clb)).toMatch(/Paivio|dual coding/);
  });
  it('contient Dweck et growth mindset', () => {
    expect(text(clb)).toMatch(/Dweck/);
    expect(text(clb)).toMatch(/growth mindset|mindset de croissance/i);
  });
  it('contient Dunlosky et efficacité des techniques', () => {
    expect(text(clb)).toMatch(/Dunlosky/);
    expect(text(clb)).toMatch(/retrieval practice|[Ss]urlignage/);
  });
  it('contient Gardner et intelligences multiples', () => {
    expect(text(clb)).toMatch(/Gardner/);
    expect(text(clb)).toMatch(/[Ii]ntelligences multiples/);
    expect(text(clb)).toMatch(/linguistique|musicale|kinesthésique/);
  });
  it('contient Sternberg triarchique', () => {
    expect(text(clb)).toMatch(/Sternberg/);
    expect(text(clb)).toMatch(/analytique|créative|pratique/);
  });
  it('contient dopamine et curiosité apprentissage', () => {
    expect(text(clb)).toMatch(/dopamine/);
    expect(text(clb)).toMatch(/curiosit/);
    expect(text(clb)).toMatch(/LTP/);
  });
  it('contient BDNF et exercice physique', () => {
    expect(text(clb)).toMatch(/BDNF/);
    expect(text(clb)).toMatch(/exercice/);
  });
  it('contient consolidation du sommeil', () => {
    expect(text(clb)).toMatch(/sommeil/);
    expect(text(clb)).toMatch(/SLP|REM|lent profond|paradoxal/);
    expect(text(clb)).toMatch(/consolidation/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 3 — Structure relations_amoureuses_attachment_couples
// ─────────────────────────────────────────────────────────────────────────────

describe('RAC — structure JSON', () => {
  it('has version v31.5.8', () => {
    expect(rac.version).toBe('v31.5.8');
  });
  it('has category relations_amoureuses_attachment_couples', () => {
    expect(rac.category).toBe('relations_amoureuses_attachment_couples');
  });
  it('has a non-empty description', () => {
    expect(typeof rac.description).toBe('string');
    expect((rac.description as string).length).toBeGreaterThan(10);
  });
  it('has retrieval_triggers array with >=40 entries', () => {
    expect(Array.isArray(rac.retrieval_triggers)).toBe(true);
    expect((rac.retrieval_triggers as string[]).length).toBeGreaterThanOrEqual(40);
  });
  it('has sections object', () => {
    expect(typeof rac.sections).toBe('object');
    expect(rac.sections).not.toBeNull();
  });
  it('has 7 sections', () => {
    expect(Object.keys(rac.sections as object).length).toBe(7);
  });
  it('includes key sections', () => {
    const secs = Object.keys(rac.sections as object);
    expect(secs).toContain('theories_amour');
    expect(secs).toContain('attachement_adulte_couple');
    expect(secs).toContain('gottman_science_couple');
    expect(secs).toContain('communication_couples_therapie');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 4 — Contenu core RAC
// ─────────────────────────────────────────────────────────────────────────────

describe('RAC — contenu core relations et attachement adulte', () => {
  it("contient Sternberg triangle de l'amour", () => {
    expect(text(rac)).toMatch(/Sternberg/);
    expect(text(rac)).toMatch(/triangle/i);
    expect(text(rac)).toMatch(/consummate|parfait/);
  });
  it('contient les 3 composantes: passion, intimité, engagement', () => {
    expect(text(rac)).toMatch(/passion/);
    expect(text(rac)).toMatch(/intimit/);
    expect(text(rac)).toMatch(/engagement/);
  });
  it('contient Lee et les 6 styles amoureux', () => {
    expect(text(rac)).toMatch(/Lee/);
    expect(text(rac)).toMatch(/eros/i);
    expect(text(rac)).toMatch(/ludus|pragma|agape/i);
  });
  it('contient attachement adulte AAI', () => {
    expect(text(rac)).toMatch(/Hazan|Bartholomew/);
    expect(text(rac)).toMatch(/[Ss]écure/);
    expect(text(rac)).toMatch(/[Aa]nxieux|[Éé]vitant/);
  });
  it('contient IWM et ECR-R', () => {
    expect(text(rac)).toMatch(/IWM/);
    expect(text(rac)).toMatch(/ECR-R/);
    expect(text(rac)).toMatch(/Bowlby/);
  });
  it('contient EFT couple (Johnson)', () => {
    expect(text(rac)).toMatch(/EFT|Johnson/);
  });
  it('contient les 4 cavaliers de Gottman', () => {
    expect(text(rac)).toMatch(/Gottman/);
    expect(text(rac)).toMatch(/[Cc]avaliers/);
    expect(text(rac)).toMatch(/[Mm]épris/);
  });
  it('contient ratio 5:1 Gottman', () => {
    expect(text(rac)).toMatch(/5:1|5\/1/);
    expect(text(rac)).toMatch(/[Bb]ienveillant|positiv/);
  });
  it('contient schémas Young et dépendance affective', () => {
    expect(text(rac)).toMatch(/Young/);
    expect(text(rac)).toMatch(/abandon|dévalorisation/);
    expect(text(rac)).toMatch(/[Dd]épendance affective|codépendance/);
  });
  it('contient jalousie et Buss évolutionnaire', () => {
    expect(text(rac)).toMatch(/Buss/);
    expect(text(rac)).toMatch(/jalousie/);
    expect(text(rac)).toMatch(/paternit/);
  });
  it('contient Fisher et neuroimagerie de la rupture', () => {
    expect(text(rac)).toMatch(/Fisher/);
    expect(text(rac)).toMatch(/[Rr]upture|deuil amoureux/);
    expect(text(rac)).toMatch(/dopaminergique|[Rr]écompense/);
  });
  it("contient les 5 langages de l'amour (Chapman)", () => {
    expect(text(rac)).toMatch(/Chapman/);
    expect(text(rac)).toMatch(/5 langages|cinq langages/i);
    expect(text(rac)).toMatch(/[Tt]emps de qualit[eé]|[Cc]ontact physique/);
  });
  it('contient Hendrix et Imago Relationship Therapy', () => {
    expect(text(rac)).toMatch(/Hendrix/);
    expect(text(rac)).toMatch(/Imago/);
    expect(text(rac)).toMatch(/miroir/);
  });
  it('contient assertivité et communication CNV', () => {
    expect(text(rac)).toMatch(/assertivit/);
    expect(text(rac)).toMatch(/NVC|Rosenberg|CNV/);
  });
  it('contient deuil de Bowlby et résilience post-rupture', () => {
    expect(text(rac)).toMatch(/Bowlby/);
    expect(text(rac)).toMatch(/[Rr]ésilience/);
    expect(text(rac)).toMatch(/Tedeschi|croissance post-traumatique/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 5 — Cohérence cross-module
// ─────────────────────────────────────────────────────────────────────────────

describe('Cross-module — cohérence phases 38', () => {
  it('CLB et RAC ont des versions différentes', () => {
    expect(clb.version).not.toBe(rac.version);
  });
  it('CLB et RAC ont des catégories différentes', () => {
    expect(clb.category).not.toBe(rac.category);
  });
  it('CLB triggers contiennent créativité et apprentissage', () => {
    const t = clb.retrieval_triggers as string[];
    expect(t.some(x => /créativité|créatif/i.test(x))).toBe(true);
    expect(t.some(x => /apprentissage|apprendre/i.test(x))).toBe(true);
  });
  it('RAC triggers contiennent amour et couple', () => {
    const t = rac.retrieval_triggers as string[];
    expect(t.some(x => /amour|aimer/i.test(x))).toBe(true);
    expect(t.some(x => /couple/i.test(x))).toBe(true);
  });
  it('CLB et RAC ont chacun 7 sections', () => {
    expect(Object.keys(clb.sections as object).length).toBe(7);
    expect(Object.keys(rac.sections as object).length).toBe(7);
  });
  it('Les deux fichiers sont des JSON valides avec toutes les clés obligatoires', () => {
    for (const kb of [clb, rac]) {
      expect(kb).toHaveProperty('version');
      expect(kb).toHaveProperty('category');
      expect(kb).toHaveProperty('description');
      expect(kb).toHaveProperty('retrieval_triggers');
      expect(kb).toHaveProperty('sections');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 6 — Unit core CLB (termes précis)
// ─────────────────────────────────────────────────────────────────────────────

describe('CLB — unit core précis', () => {
  it('Wallas apparaît dans creativite_processus', () => {
    const s = text((clb.sections as Record<string, unknown>)['creativite_processus']);
    expect(s).toMatch(/Wallas/);
  });
  it('Kolb apparaît dans apprentissage_modeles_pedagogiques', () => {
    const s = text(
      (clb.sections as Record<string, unknown>)['apprentissage_modeles_pedagogiques']
    );
    expect(s).toMatch(/Kolb/);
  });
  it('Ebbinghaus apparaît dans memoire_strategies_optimales', () => {
    const s = text(
      (clb.sections as Record<string, unknown>)['memoire_strategies_optimales']
    );
    expect(s).toMatch(/Ebbinghaus/);
  });
  it('Dweck apparaît dans metacognition_autoregulation', () => {
    const s = text(
      (clb.sections as Record<string, unknown>)['metacognition_autoregulation']
    );
    expect(s).toMatch(/Dweck/);
  });
  it('Gardner apparaît dans intelligences_theories', () => {
    const s = text((clb.sections as Record<string, unknown>)['intelligences_theories']);
    expect(s).toMatch(/Gardner/);
  });
  it('BDNF apparaît dans neurosciences_apprentissage', () => {
    const s = text(
      (clb.sections as Record<string, unknown>)['neurosciences_apprentissage']
    );
    expect(s).toMatch(/BDNF/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 7 — Unit core RAC (termes précis)
// ─────────────────────────────────────────────────────────────────────────────

describe('RAC — unit core précis', () => {
  it('Sternberg apparaît dans theories_amour', () => {
    const s = text((rac.sections as Record<string, unknown>)['theories_amour']);
    expect(s).toMatch(/Sternberg/);
  });
  it('ECR-R apparaît dans attachement_adulte_couple', () => {
    const s = text(
      (rac.sections as Record<string, unknown>)['attachement_adulte_couple']
    );
    expect(s).toMatch(/ECR-R/);
  });
  it('Mépris apparaît dans gottman_science_couple', () => {
    const s = text((rac.sections as Record<string, unknown>)['gottman_science_couple']);
    expect(s).toMatch(/[Mm]épris/);
  });
  it('Young apparaît dans dependance_affective_schemas', () => {
    const s = text(
      (rac.sections as Record<string, unknown>)['dependance_affective_schemas']
    );
    expect(s).toMatch(/Young/);
  });
  it('Fisher apparaît dans rupture_deuil_amoureux', () => {
    const s = text((rac.sections as Record<string, unknown>)['rupture_deuil_amoureux']);
    expect(s).toMatch(/Fisher/);
  });
  it('Chapman apparaît dans communication_couples_therapie', () => {
    const s = text(
      (rac.sections as Record<string, unknown>)['communication_couples_therapie']
    );
    expect(s).toMatch(/Chapman/);
  });
});
