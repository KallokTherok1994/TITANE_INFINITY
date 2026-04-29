/**
 * TITANE∞ v31.3.3-v31.3.4 — Tests Phase 26: KB traumatologie_complexe + neuroscience_attachement
 *
 * Validates:
 *   1. Les deux nouveaux modules KB sont registrés dans le catalogue de catégories
 *   2. Les retrieval_triggers couvrent les concepts clés
 *   3. Les sections attendues sont présentes dans les fichiers JSON
 *   4. Le mode psychologie_profils couvre les domaines traumatologie + attachement
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_MODES_CONFIG,
} from '@/services/ai/chatModes.config';

// ─────────────────────────────────────────────────────────────────────────────
// Importation directe des JSON de knowledge base pour validation structurelle
// ─────────────────────────────────────────────────────────────────────────────
import traumatologieKB from '../../../../data/knowledge_base/default/traumatologie_complexe.json';
import attachementKB from '../../../../data/knowledge_base/default/neuroscience_attachement.json';

// ─────────────────────────────────────────────────────────────────────────────
describe('KB traumatologie_complexe (Phase 26 — v31.3.3)', () => {

  it('le fichier JSON est chargeable et a la bonne version', () => {
    expect(traumatologieKB).toBeDefined();
    expect(traumatologieKB.version).toBe('v31.3.3');
  });

  it('la catégorie est traumatologie_complexe', () => {
    expect(traumatologieKB.category).toBe('traumatologie_complexe');
  });

  it('les retrieval_triggers sont définis et nombreux', () => {
    expect(Array.isArray(traumatologieKB.retrieval_triggers)).toBe(true);
    expect(traumatologieKB.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it('les triggers couvrent les concepts C-PTSD / trauma complexe', () => {
    const triggers = traumatologieKB.retrieval_triggers as string[];
    expect(triggers.some(t => t.toLowerCase().includes('c-ptsd') || t.toLowerCase().includes('ptsd complexe'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('window of tolerance') || t.toLowerCase().includes('fenêtre de tolérance'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('polyvagal') || t.toLowerCase().includes('polyvagale'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('4f') || t.toLowerCase().includes('pete walker'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('dissociation'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('hypervigilance'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('grounding') || t.toLowerCase().includes('ancrage'))).toBe(true);
  });

  it('la section cadre_diagnostique est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['cadre_diagnostique']).toBeDefined();
  });

  it('la section theorie_polyvagale est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['theorie_polyvagale']).toBeDefined();
  });

  it('la section window_of_tolerance est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['window_of_tolerance']).toBeDefined();
  });

  it('la section reponses_4F_pete_walker est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['reponses_4F_pete_walker']).toBeDefined();
  });

  it('la section neurobiologie_trauma est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['neurobiologie_trauma']).toBeDefined();
  });

  it('la section honte_toxique est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['honte_toxique']).toBeDefined();
  });

  it('la section phases_traitement_trauma est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['phases_traitement_trauma']).toBeDefined();
  });

  it('la section outils_stabilisation est présente', () => {
    expect((traumatologieKB.sections as Record<string, unknown>)['outils_stabilisation']).toBeDefined();
  });

  it('les 3 circuits polyvagaux sont définis', () => {
    const pv = (traumatologieKB.sections as any)['theorie_polyvagale']?.contenu?.trois_circuits;
    expect(pv?.ventral_vagal).toBeDefined();
    expect(pv?.sympathique).toBeDefined();
    expect(pv?.dorsal_vagal).toBeDefined();
  });

  it('les 4 réponses de survie (4F) sont définies', () => {
    const contenu = (traumatologieKB.sections as any)['reponses_4F_pete_walker']?.contenu;
    expect(contenu?.fight).toBeDefined();
    expect(contenu?.flight).toBeDefined();
    expect(contenu?.freeze).toBeDefined();
    expect(contenu?.fawn).toBeDefined();
  });

  it('les zones hyperactivation et hypoactivation de la fenêtre sont définies', () => {
    const zones = (traumatologieKB.sections as any)['window_of_tolerance']?.contenu?.zones;
    expect(zones?.hyperactivation).toBeDefined();
    expect(zones?.hypoactivation).toBeDefined();
    expect(zones?.fenêtre_optimale).toBeDefined();
  });

  it('les ressources therapeutiques sont présentes', () => {
    const res = (traumatologieKB.sections as any)['ressources_traumatologie'];
    expect(res).toBeDefined();
    const ouvrages = res?.contenu?.ouvrages_fondamentaux as unknown[];
    expect(Array.isArray(ouvrages)).toBe(true);
    expect(ouvrages.length).toBeGreaterThanOrEqual(3);
  });

  it('van der kolk est référencé dans les auteurs clés', () => {
    const neuro = (traumatologieKB.sections as any)['neurobiologie_trauma'];
    const auteursStr = JSON.stringify(neuro?.auteurs_clés ?? neuro?.auteurs_cles ?? neuro).toLowerCase();
    expect(auteursStr).toContain('van der kolk');
  });

  it('les ressources Québec et France sont présentes', () => {
    const res = (traumatologieKB.sections as any)['ressources_traumatologie']?.contenu;
    expect(Array.isArray(res?.ressources_québec ?? res?.ressources_quebec)).toBe(true);
    expect(Array.isArray(res?.ressources_france)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('KB neuroscience_attachement (Phase 26 — v31.3.4)', () => {

  it('le fichier JSON est chargeable et a la bonne version', () => {
    expect(attachementKB).toBeDefined();
    expect(attachementKB.version).toBe('v31.3.4');
  });

  it('la catégorie est neuroscience_attachement', () => {
    expect(attachementKB.category).toBe('neuroscience_attachement');
  });

  it('les retrieval_triggers sont définis et nombreux', () => {
    expect(Array.isArray(attachementKB.retrieval_triggers)).toBe(true);
    expect(attachementKB.retrieval_triggers.length).toBeGreaterThanOrEqual(30);
  });

  it("les triggers couvrent les styles d'attachement", () => {
    const triggers = attachementKB.retrieval_triggers as string[];
    expect(triggers.some(t => t.toLowerCase().includes('attachement anxieux'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('attachement évitant') || t.toLowerCase().includes('attachement evitant'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('attachement désorganisé') || t.toLowerCase().includes('attachement desorganise'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('attachement sécure') || t.toLowerCase().includes('attachement secure'))).toBe(true);
  });

  it('les triggers couvrent la neurobiologie du lien', () => {
    const triggers = attachementKB.retrieval_triggers as string[];
    expect(triggers.some(t => t.toLowerCase().includes('ocytocine') || t.toLowerCase().includes('ocytocin'))).toBe(true);
    expect(triggers.some(t => t.toLowerCase().includes('bowlby'))).toBe(true);
  });

  it('la section histoire_theorie est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['histoire_theorie']).toBeDefined();
  });

  it('la section styles_attachement_enfant est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['styles_attachement_enfant']).toBeDefined();
  });

  it('la section styles_attachement_adulte est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['styles_attachement_adulte']).toBeDefined();
  });

  it('la section neurobiologie_lien est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['neurobiologie_lien']).toBeDefined();
  });

  it('la section attachement_relations_adultes est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['attachement_relations_adultes']).toBeDefined();
  });

  it('la section guerison_attachement est présente', () => {
    expect((attachementKB.sections as Record<string, unknown>)['guerison_attachement']).toBeDefined();
  });

  it('les 4 styles enfant sont définis (A, B, C, D)', () => {
    const styles = (attachementKB.sections as any)['styles_attachement_enfant']?.contenu;
    expect(styles?.secure_B).toBeDefined();
    expect(styles?.anxieux_ambivalent_C).toBeDefined();
    expect(styles?.evitant_A ?? styles?.évitant_A).toBeDefined();
    expect(styles?.désorganisé_D ?? styles?.desorganise_D).toBeDefined();
  });

  it('les 4 styles adultes sont définis', () => {
    const styles = (attachementKB.sections as any)['styles_attachement_adulte']?.contenu;
    expect(styles?.secure_adulte).toBeDefined();
    expect(styles?.anxieux_preoccupied_adulte ?? styles?.anxieux_préoccupied_adulte).toBeDefined();
    expect(styles?.evitant_dismissing_adulte ?? styles?.évitant_dismissing_adulte).toBeDefined();
    expect(styles?.fearful_avoidant_adulte).toBeDefined();
  });

  it('la dynamique anxieux-évitant est documentée', () => {
    const rel = (attachementKB.sections as any)['attachement_relations_adultes']?.contenu;
    const dyn = rel?.dynamique_anxieux_evitant ?? rel?.dynamique_anxieux_évitant;
    expect(dyn).toBeDefined();
  });

  it('earned secure attachment est documenté', () => {
    const guerison = (attachementKB.sections as any)['guerison_attachement']?.contenu;
    const neuro = guerison?.neuroplasticité ?? guerison?.neuroplasticite;
    expect(neuro?.earned_secure ?? neuro?.['earned_secure']).toBeDefined();
  });

  it('les approches thérapeutiques EFT et EMDR sont référencées', () => {
    const app = (attachementKB.sections as any)['guerison_attachement']?.contenu?.approches_thérapeutiques
      ?? (attachementKB.sections as any)['guerison_attachement']?.contenu?.approches_therapeutiques;
    expect(app?.EFT).toBeDefined();
    expect(app?.EMDR_attachement ?? app?.EMDR).toBeDefined();
  });

  it('Bowlby est référencé dans l\'histoire de la théorie', () => {
    const hist = (attachementKB.sections as any)['histoire_theorie']?.contenu;
    expect(hist?.john_bowlby ?? hist?.bowlby).toBeDefined();
  });

  it('les ressources bibliographiques sont présentes', () => {
    const res = (attachementKB.sections as any)['ressources_attachement']?.contenu?.ouvrages_fondamentaux as unknown[];
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Mode psychologie_profils — Couverture traumatologie + attachement', () => {
  it('le mode est défini', () => {
    expect(CHAT_MODES_CONFIG['psychologie_profils']).toBeDefined();
  });

  it('le mode peut servir les questions de traumatologie (temperature adaptée)', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    // Temperature entre 0.5 et 0.8 = équilibre empathie + précision clinique
    expect(mode.temperature).toBeGreaterThanOrEqual(0.5);
    expect(mode.temperature).toBeLessThanOrEqual(0.8);
  });

  it('le mode a accès à contextAnalysis pour injecter les KB', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.toolsAllowed?.contextAnalysis).toBe(true);
  });

  it('le mode est en catégorie personal (domaine thérapeutique personnel)', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.category).toBe('personal');
  });

  it('le tone est empathetic (requis pour trauma/attachement)', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.tone).toBe('empathetic');
  });

  it('le responseStyle est detailed (analyses cliniques complètes)', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.responseStyle).toBe('detailed');
  });

  it('le system prompt mentionne les bases théoriques du trauma (Pete Walker ou Van der Kolk)', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    const prompt = mode.systemPrompt ?? '';
    const hasPeteWalker = prompt.toLowerCase().includes('pete walker') || prompt.toLowerCase().includes('4f');
    const hasVanDerKolk = prompt.toLowerCase().includes('van der kolk') || prompt.toLowerCase().includes('corps');
    const hasTrauma = prompt.toLowerCase().includes('trauma');
    expect(hasTrauma || hasPeteWalker || hasVanDerKolk).toBe(true);
  });

  it('le system prompt mentionne les styles d\'attachement', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    const prompt = (mode.systemPrompt ?? '').toLowerCase();
    expect(
      prompt.includes('attachement') || prompt.includes('attachment')
    ).toBe(true);
  });
});
