/**
 * Tests KB Phase 40:
 * - psychologie_positive_bien_etre (v31.5.11)
 * - cognition_sociale_biais_cognitifs (v31.5.12)
 *
 * Rule 16 — generated in same commit as KB modules.
 */
import { describe, it, expect } from 'vitest';
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

type KBModule = {
  version: string;
  category: string;
  description: string;
  retrieval_triggers: string[];
  sections: Record<string, unknown>;
};

function kb(name: string): KBModule {
  return loadJson(name) as KBModule;
}

// ═══════════════════════════════════════════════════════════════════════════
// psychologie_positive_bien_etre — v31.5.11
// ═══════════════════════════════════════════════════════════════════════════
describe('KB Phase 40 — psychologie_positive_bien_etre (v31.5.11)', () => {
  const ID = 'psychologie_positive_bien_etre';

  it('loads and parses without error', () => {
    expect(() => kb(ID)).not.toThrow();
  });

  it('has correct version v31.5.11', () => {
    expect(kb(ID).version).toBe('v31.5.11');
  });

  it('has category psychologie_positive_bien_etre', () => {
    expect(kb(ID).category).toBe('psychologie_positive_bien_etre');
  });

  it('has at least 40 retrieval_triggers', () => {
    expect(kb(ID).retrieval_triggers.length).toBeGreaterThanOrEqual(40);
  });

  it('has 7 sections', () => {
    expect(Object.keys(kb(ID).sections).length).toBe(7);
  });

  // Triggers — PERMA / Seligman
  it('trigger: psychologie positive', () => {
    expect(kb(ID).retrieval_triggers).toContain('psychologie positive');
  });
  it('trigger: bien-être', () => {
    expect(kb(ID).retrieval_triggers).toContain('bien-être');
  });
  it('trigger: PERMA', () => {
    expect(kb(ID).retrieval_triggers).toContain('PERMA');
  });
  it('trigger: Seligman', () => {
    expect(kb(ID).retrieval_triggers).toContain('Seligman');
  });
  it('trigger: bonheur', () => {
    expect(kb(ID).retrieval_triggers).toContain('bonheur');
  });
  it('trigger: flourishing', () => {
    expect(kb(ID).retrieval_triggers).toContain('flourishing');
  });
  it('trigger: forces de caractère', () => {
    expect(kb(ID).retrieval_triggers).toContain('forces de caractère');
  });
  it('trigger: VIA', () => {
    expect(kb(ID).retrieval_triggers).toContain('VIA');
  });
  it('trigger: gratitude', () => {
    expect(kb(ID).retrieval_triggers).toContain('gratitude');
  });
  it('trigger: flow', () => {
    expect(kb(ID).retrieval_triggers).toContain('flow');
  });
  it('trigger: Csikszentmihalyi', () => {
    expect(kb(ID).retrieval_triggers).toContain('Csikszentmihalyi');
  });
  it('trigger: optimisme', () => {
    expect(kb(ID).retrieval_triggers).toContain('optimisme');
  });
  it('trigger: sens', () => {
    expect(kb(ID).retrieval_triggers).toContain('sens');
  });

  // Sections
  it('section: modele_perma_seligman', () => {
    expect(kb(ID).sections).toHaveProperty('modele_perma_seligman');
  });
  it('section: forces_caractere_via', () => {
    expect(kb(ID).sections).toHaveProperty('forces_caractere_via');
  });
  it('section: emotions_positives_broaden_build', () => {
    expect(kb(ID).sections).toHaveProperty('emotions_positives_broaden_build');
  });
  it('section: flow_engagement_optimal', () => {
    expect(kb(ID).sections).toHaveProperty('flow_engagement_optimal');
  });
  it('section: resilience_post_traumatique', () => {
    expect(kb(ID).sections).toHaveProperty('resilience_post_traumatique');
  });
  it('section: mindfulness_contemplation', () => {
    expect(kb(ID).sections).toHaveProperty('mindfulness_contemplation');
  });
  it('section: bien_etre_social_altruisme', () => {
    expect(kb(ID).sections).toHaveProperty('bien_etre_social_altruisme');
  });

  // Content probes
  it('contient PERMA dans les sections', () => {
    expect(text(kb(ID).sections)).toMatch(/PERMA/);
  });
  it('contient Fredrickson ou broaden-and-build', () => {
    expect(text(kb(ID).sections)).toMatch(/Fredrickson|broaden|build/i);
  });
  it('contient résilience ou post-traumatique', () => {
    expect(text(kb(ID).sections)).toMatch(/r.silience|post.traumatique/i);
  });
  it('contient mindfulness ou pleine conscience', () => {
    expect(text(kb(ID).sections)).toMatch(/mindfulness|pleine.conscience/i);
  });
  it('contient altruisme ou bienveillance', () => {
    expect(text(kb(ID).sections)).toMatch(/altruisme|bienveillance/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// cognition_sociale_biais_cognitifs — v31.5.12
// ═══════════════════════════════════════════════════════════════════════════
describe('KB Phase 40 — cognition_sociale_biais_cognitifs (v31.5.12)', () => {
  const ID = 'cognition_sociale_biais_cognitifs';

  it('loads and parses without error', () => {
    expect(() => kb(ID)).not.toThrow();
  });

  it('has correct version v31.5.12', () => {
    expect(kb(ID).version).toBe('v31.5.12');
  });

  it('has category cognition_sociale_biais_cognitifs', () => {
    expect(kb(ID).category).toBe('cognition_sociale_biais_cognitifs');
  });

  it('has at least 40 retrieval_triggers', () => {
    expect(kb(ID).retrieval_triggers.length).toBeGreaterThanOrEqual(40);
  });

  it('has 7 sections', () => {
    expect(Object.keys(kb(ID).sections).length).toBe(7);
  });

  // Triggers — Kahneman / biais
  it('trigger: biais cognitif', () => {
    expect(kb(ID).retrieval_triggers).toContain('biais cognitif');
  });
  it('trigger: heuristique', () => {
    expect(kb(ID).retrieval_triggers).toContain('heuristique');
  });
  it('trigger: Kahneman', () => {
    expect(kb(ID).retrieval_triggers).toContain('Kahneman');
  });
  it('trigger: système 1', () => {
    expect(kb(ID).retrieval_triggers).toContain('système 1');
  });
  it('trigger: système 2', () => {
    expect(kb(ID).retrieval_triggers).toContain('système 2');
  });
  it('trigger: biais de confirmation', () => {
    expect(kb(ID).retrieval_triggers).toContain('biais de confirmation');
  });
  it('trigger: Dunning-Kruger', () => {
    expect(kb(ID).retrieval_triggers).toContain('Dunning-Kruger');
  });
  it('trigger: métacognition', () => {
    expect(kb(ID).retrieval_triggers).toContain('métacognition');
  });
  it('trigger: cognition sociale', () => {
    expect(kb(ID).retrieval_triggers).toContain('cognition sociale');
  });
  it('trigger: attribution', () => {
    expect(kb(ID).retrieval_triggers).toContain('attribution');
  });
  it('trigger: empathie ou ToM', () => {
    const triggers = text(kb(ID).retrieval_triggers);
    expect(triggers).toMatch(/empathie|théorie de l.esprit|mentalisation/i);
  });
  it('trigger: stéréotype ou préjugé', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(/st.r.otype|pr.jug./i);
  });
  it('trigger: conformisme ou influence sociale', () => {
    expect(text(kb(ID).retrieval_triggers)).toMatch(/conformisme|influence sociale/i);
  });

  // Sections
  it('section: systeme1_systeme2_kahneman', () => {
    expect(kb(ID).sections).toHaveProperty('systeme1_systeme2_kahneman');
  });
  it('section: biais_cognitifs_classiques', () => {
    expect(kb(ID).sections).toHaveProperty('biais_cognitifs_classiques');
  });
  it('section: attribution_perception_sociale', () => {
    expect(kb(ID).sections).toHaveProperty('attribution_perception_sociale');
  });
  it('section: theorie_esprit_empathie', () => {
    expect(kb(ID).sections).toHaveProperty('theorie_esprit_empathie');
  });
  it('section: stereotypes_prejudices', () => {
    expect(kb(ID).sections).toHaveProperty('stereotypes_prejudices');
  });
  it('section: influence_sociale_conformisme', () => {
    expect(kb(ID).sections).toHaveProperty('influence_sociale_conformisme');
  });
  it('section: decision_groupes', () => {
    expect(kb(ID).sections).toHaveProperty('decision_groupes');
  });

  // Content probes
  it('contient Kahneman dans les sections', () => {
    expect(text(kb(ID).sections)).toMatch(/Kahneman/);
  });
  it('contient biais de confirmation', () => {
    expect(text(kb(ID).sections)).toMatch(/confirmation/i);
  });
  it("contient théorie de l'esprit ou ToM", () => {
    expect(text(kb(ID).sections)).toMatch(/th.orie de l.esprit|ToM|mentalisation/i);
  });
  it('contient Asch ou conformisme', () => {
    expect(text(kb(ID).sections)).toMatch(/Asch|conformisme|Milgram/i);
  });
  it('contient pensée de groupe ou groupthink', () => {
    expect(text(kb(ID).sections)).toMatch(/groupthink|pens.e de groupe|Janis/i);
  });
});
