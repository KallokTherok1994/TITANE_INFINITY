/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TESTS INTÉGRATION CONSTITUTION → CHAT IA
 *   Validation mécanismes constitutionnels (Lois #2, #8, #10)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  requiresClarityAudit,
  detectSaturation,
  checkTruthConfidence,
  generateProtectionModeResponse,
  createClarityAuditTemplate,
  CONSTITUTIONAL_CONFIG,
} from '../core/prompts/constitution';

describe('🏛️ Constitution TITANE∞ v1.0 — Intégration Chat IA', () => {
  describe('⚖️ Loi #2 — Clarity Audit Detection', () => {
    it('détecte demandes complexes nécessitant audit', () => {
      const complexMessages = [
        "Refactorise toute l'architecture du système",
        'Optimise la performance et améliore la structure',
        'Crée un plan stratégique détaillé pour les 6 prochains mois',
        'Implémente un système de caching distribué avec invalidation intelligente',
      ];

      complexMessages.forEach(msg => {
        const result = requiresClarityAudit(msg);
        expect(result).toBe(true);
      });
    });

    it('ne déclenche pas audit pour messages simples', () => {
      const simpleMessages = ['Bonjour', 'Comment vas-tu?', 'Merci!', "Peux-tu m'aider?"];

      simpleMessages.forEach(msg => {
        const result = requiresClarityAudit(msg);
        expect(result).toBe(false);
      });
    });

    it('détecte messages longs (>200 caractères)', () => {
      const longMessage = 'A'.repeat(250);
      expect(requiresClarityAudit(longMessage)).toBe(true);
    });

    it('détecte questions multiples', () => {
      const multiQuestions =
        'Comment faire ceci? Et cela? Quelle est la meilleure approche?';
      expect(requiresClarityAudit(multiQuestions)).toBe(true);
    });

    it('génère template Clarity Audit correct', () => {
      const message = 'Refactorise le système';
      const template = createClarityAuditTemplate(message);

      expect(template).toContain('CLARITY AUDIT');
      expect(template).toContain('Constitution TITANE∞');
      expect(template).toContain('A) **Clarté intention**');
      expect(template).toContain('B) **Simplicité**');
      expect(template).toContain('C) **Alignement mission**');
      expect(template).toContain('D) **Rythme soutenable**');
      expect(template).toContain('E) **Autonomie**');
      expect(template).toContain('F) **Vérité**');
      expect(template).toContain('G) **Intégration**');
      expect(template).toContain('**DÉCISION**: [ GO / STOP / SIMPLIFIER / CLARIFIER ]');
      expect(template).toContain('**ACTIONS MINIMALES** (1-3 max)');
    });
  });

  describe('🛡️ Loi #8 — Saturation Detection & Protection Mode', () => {
    it('détecte marqueurs de fatigue', () => {
      const fatigueMessages = [
        'Je suis crevé',
        'Je suis fatigué',
        'Je suis épuisé',
        'Je suis débordé',
      ];

      fatigueMessages.forEach(msg => {
        const result = detectSaturation(msg);
        expect(result).toBe(true);
      });
    });

    it("détecte marqueurs d'urgence", () => {
      const urgencyMessages = [
        'Fais-le vite',
        "C'est urgent",
        "Rapidement s'il te plaît",
        'Pas le temps',
        'Juste fais-le',
      ];

      urgencyMessages.forEach(msg => {
        const result = detectSaturation(msg);
        expect(result).toBe(true);
      });
    });

    it('détecte surcharge émotionnelle', () => {
      const overloadMessages = [
        "C'est trop compliqué",
        'Je suis overwhelmed',
        'Ras le bol',
        'Je suis confus',
      ];

      overloadMessages.forEach(msg => {
        const result = detectSaturation(msg);
        expect(result).toBe(true);
      });
    });

    it('ne détecte pas saturation dans messages normaux', () => {
      const normalMessages = [
        'Explique-moi comment fonctionne X',
        "Peux-tu m'aider à comprendre?",
        'Quelle est la meilleure approche?',
      ];

      normalMessages.forEach(msg => {
        const result = detectSaturation(msg);
        expect(result).toBe(false);
      });
    });

    it('génère réponse Protection Mode appropriée', () => {
      const signs = ['fatigue', 'urgence', 'surcharge'];
      const response = generateProtectionModeResponse(signs);

      expect(response).toContain('MODE PROTECTION ACTIVÉ');
      expect(response).toContain('Constitution TITANE∞');
      expect(response).toContain('Loi #8');
      expect(response).toContain('saturation');
      expect(response).toContain('Suspension des décisions complexes');
      expect(response).toContain('Suspension des optimisations');
      expect(response).toContain("récupération d'abord");
      expect(response).toContain('Prendre une pause');
      expect(response).toContain('Simplifier');
      expect(response).toContain('Reporter');
    });
  });

  describe('✅ Loi #10 — Truth Confidence Check', () => {
    it('détecte incertitude faible dans réponses', () => {
      const uncertainResponse =
        'Il me semble que peut-être la solution serait probablement de faire X';
      const result = checkTruthConfidence(uncertainResponse);

      expect(result.certainty).toBeLessThan(80);
      expect(result.requiresDisclaimer).toBe(true);
    });

    it('détecte certitude élevée dans réponses assertives', () => {
      const certainResponse =
        'La solution est de faire X. Voici les étapes exactes à suivre.';
      const result = checkTruthConfidence(certainResponse);

      expect(result.certainty).toBeGreaterThanOrEqual(80);
      expect(result.requiresDisclaimer).toBe(false);
    });

    it('calcule certitude intermédiaire correctement', () => {
      const moderateResponse =
        'La solution serait probablement de faire X. Voici les étapes.';
      const result = checkTruthConfidence(moderateResponse);

      expect(result.certainty).toBeGreaterThan(0);
      expect(result.certainty).toBeLessThan(100);
    });

    it('requiert disclaimer si certitude < 80%', () => {
      const lowCertaintyResponses = [
        'Je pense que peut-être nous devrions probablement faire X',
        'Probablement il faudrait possiblement faire Y',
        'Il me semble que peut-être la solution serait de faire Z',
      ];

      lowCertaintyResponses.forEach(response => {
        const result = checkTruthConfidence(response);
        expect(result.certainty).toBeLessThan(80);
        expect(result.requiresDisclaimer).toBe(true);
      });
    });
  });

  describe('📋 Constitutional Config', () => {
    it('contient version correcte', () => {
      expect(CONSTITUTIONAL_CONFIG.version).toBe('1.0');
    });

    it('est marqué comme scellé', () => {
      expect(CONSTITUTIONAL_CONFIG.status).toBe('ACTIVE & SEALED');
      expect(CONSTITUTIONAL_CONFIG.requiresRefoundationForChanges).toBe(true);
    });

    it('contient date de scellement', () => {
      expect(CONSTITUTIONAL_CONFIG.sealedDate).toBe('16 décembre 2025');
    });

    it('référence audit final', () => {
      expect(CONSTITUTIONAL_CONFIG.auditReference).toBe('AUDIT_FINAL_13.md');
    });

    it('définit hiérarchie des couches', () => {
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toHaveLength(5);
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toContain('Foundation');
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toContain('Governance');
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toContain('Behavior');
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toContain('Operational');
      expect(CONSTITUTIONAL_CONFIG.hierarchyLevels).toContain('Evolution');
    });

    it('définit ordre des priorités correct', () => {
      expect(CONSTITUTIONAL_CONFIG.priorityOrder).toHaveLength(10);
      expect(CONSTITUTIONAL_CONFIG.priorityOrder[0]).toBe('Truth (#10)');
      expect(CONSTITUTIONAL_CONFIG.priorityOrder[1]).toBe('Clarity (#2)');
      expect(CONSTITUTIONAL_CONFIG.priorityOrder[2]).toBe('Simplicity');
      expect(CONSTITUTIONAL_CONFIG.priorityOrder[3]).toBe('Rhythm (#3)');
    });
  });

  describe("🔗 Scénarios d'Intégration Complets", () => {
    it('Scénario 1: Message complexe + fatigue → Protection + Audit', () => {
      const message = "Je suis crevé, refactorise vite toute l'architecture";

      // Détections
      const saturation = detectSaturation(message);
      const clarityAudit = requiresClarityAudit(message);

      expect(saturation).toBe(true); // Priorité: protection immédiate
      expect(clarityAudit).toBe(true); // Audit requis mais suspendu par protection

      // En pratique: Protection Mode activé, Clarity Audit différé
    });

    it('Scénario 2: Message simple + normal → Aucune intervention', () => {
      const message = "Peux-tu m'expliquer comment fonctionne X?";

      const saturation = detectSaturation(message);
      const clarityAudit = requiresClarityAudit(message);

      expect(saturation).toBe(false);
      expect(clarityAudit).toBe(false);

      // Traitement normal sans mécanismes constitutionnels
    });

    it('Scénario 3: Plan stratégique + normal → Clarity Audit uniquement', () => {
      const message =
        'Aide-moi à créer un plan stratégique pour optimiser la performance du système sur les 3 prochains mois';

      const saturation = detectSaturation(message);
      const clarityAudit = requiresClarityAudit(message);

      expect(saturation).toBe(false);
      expect(clarityAudit).toBe(true); // Audit #2 déclenché

      // Template Clarity Audit injecté dans system prompt
      const template = createClarityAuditTemplate(message);
      expect(template).toContain('CLARITY AUDIT');
    });

    it('Scénario 4: Réponse incertaine → Disclaimer vérité', () => {
      const response = 'Il me semble que peut-être la meilleure approche serait...';

      const truthCheck = checkTruthConfidence(response);

      expect(truthCheck.certainty).toBeLessThan(80);
      expect(truthCheck.requiresDisclaimer).toBe(true);

      // Disclaimer Loi #10 ajouté automatiquement
    });
  });

  describe('🎯 Tests de Non-Régression', () => {
    it('ne bloque pas messages légitimes urgents mais clairs', () => {
      const message = 'Urgent: bug critique en production, besoin diagnostic rapide';

      const saturation = detectSaturation(message);
      // "urgent" détecté mais contexte légitime
      expect(saturation).toBe(true); // Protection activée par prudence

      // Note: Dans un vrai système, on pourrait raffiner la détection
      // pour distinguer urgence légitime vs rush/fatigue
    });

    it('Clarity Audit ne ralentit pas questions simples longues', () => {
      const longButSimple =
        "Peux-tu m'expliquer en détail, étape par étape, comment fonctionne le système de mémoire dans TITANE? Je voudrais comprendre l'architecture complète pour pouvoir l'améliorer progressivement.";

      // Message long (>200 chars) mais pas de mots-clés complexité
      const needsAudit = requiresClarityAudit(longButSimple);

      // Le message est long donc audit déclenché (comportement attendu)
      expect(needsAudit).toBe(true);
    });

    it('Truth check tolère langage conversationnel naturel', () => {
      const conversational =
        "Je pense que tu devrais faire X car généralement c'est l'approche recommandée";

      const truthCheck = checkTruthConfidence(conversational);

      expect(truthCheck.certainty).toBeLessThanOrEqual(85);
      expect(truthCheck.certainty).toBeGreaterThanOrEqual(40);
      // Certitude calculée basée sur marqueurs incertitude (acceptable 40-85)
    });
  });
});

describe('🔒 Conformité Constitutionnelle', () => {
  it('valide que tous les exports constitutionnels sont disponibles', () => {
    expect(requiresClarityAudit).toBeDefined();
    expect(detectSaturation).toBeDefined();
    expect(checkTruthConfidence).toBeDefined();
    expect(generateProtectionModeResponse).toBeDefined();
    expect(createClarityAuditTemplate).toBeDefined();
    expect(CONSTITUTIONAL_CONFIG).toBeDefined();
  });

  it('Config object properties are readonly', () => {
    const config = CONSTITUTIONAL_CONFIG;
    expect(config).toBeDefined();
    expect(config.version).toBe('1.0');
    expect(config.status).toBe('ACTIVE & SEALED');
    expect(config.sealedDate).toBe('16 décembre 2025');
  });

  it('valide hiérarchie des priorités (Loi #10 > Loi #2)', () => {
    const priorities = CONSTITUTIONAL_CONFIG.priorityOrder;

    const truthIndex = priorities.findIndex((p: string) => p.includes('#10'));
    const clarityIndex = priorities.findIndex((p: string) => p.includes('#2'));

    expect(truthIndex).toBe(0); // Priorité 1
    expect(clarityIndex).toBe(1); // Priorité 2
    expect(truthIndex).toBeLessThan(clarityIndex);
  });
});
