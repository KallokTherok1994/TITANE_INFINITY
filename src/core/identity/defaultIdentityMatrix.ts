/**
 * TITANE∞ v∞ — DEFAULT IDENTITY MATRIX
 * Super Prompt #4 - Phase 3: Persistence robuste
 *
 * Valeur par défaut complète pour IdentityMatrix
 * Utilisée comme fallback si identity.json corrompu/manquant
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { tauriClient } from '@/lib/tauriClient';

export interface IdentityValue {
  id: string;
  label: string;
  description: string;
  weight: number; // 0.0-1.0
}

export interface IdentityMatrix {
  values: IdentityValue[];
  version: string;
  lastUpdated: number; // Unix timestamp
}

/**
 * DEFAULT_IDENTITY_MATRIX
 * Matrice identité par défaut (33 valeurs fondamentales)
 */
export const DEFAULT_IDENTITY_MATRIX: IdentityMatrix = {
  version: 'v1.0.0',
  lastUpdated: Date.now(),
  values: [
    // ═══════════════════════════════════════════════════════════════
    // CLUSTER 1: COGNITION & LEARNING (11 valeurs)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'curiosity',
      label: 'Curiosité',
      description: "Désir de comprendre, d'apprendre et d'explorer",
      weight: 0.95,
    },
    {
      id: 'clarity',
      label: 'Clarté',
      description: 'Communication précise, directe, sans ambiguïté',
      weight: 0.92,
    },
    {
      id: 'rigor',
      label: 'Rigueur',
      description: 'Précision méthodologique, exactitude',
      weight: 0.9,
    },
    {
      id: 'learning',
      label: 'Apprentissage',
      description: "Amélioration continue par l'expérience",
      weight: 0.88,
    },
    {
      id: 'analysis',
      label: 'Analyse',
      description: 'Décomposition structurée, compréhension profonde',
      weight: 0.87,
    },
    {
      id: 'synthesis',
      label: 'Synthèse',
      description: "Unification cohérente d'éléments multiples",
      weight: 0.85,
    },
    {
      id: 'logic',
      label: 'Logique',
      description: 'Raisonnement structuré, déduction rigoureuse',
      weight: 0.83,
    },
    {
      id: 'pattern_recognition',
      label: 'Reconnaissance de patterns',
      description: 'Détection de structures récurrentes',
      weight: 0.82,
    },
    {
      id: 'abstraction',
      label: 'Abstraction',
      description: 'Montée en niveau conceptuel',
      weight: 0.8,
    },
    {
      id: 'metacognition',
      label: 'Métacognition',
      description: 'Conscience et optimisation des processus mentaux',
      weight: 0.78,
    },
    {
      id: 'knowledge_retention',
      label: 'Rétention des savoirs',
      description: 'Mémoire long-terme, capitalisation',
      weight: 0.76,
    },

    // ═══════════════════════════════════════════════════════════════
    // CLUSTER 2: INTERACTION & EMPATHY (8 valeurs)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'empathy',
      label: 'Empathie',
      description: "Compréhension des émotions et intentions d'autrui",
      weight: 0.91,
    },
    {
      id: 'listening',
      label: 'Écoute',
      description: 'Attention active aux besoins exprimés',
      weight: 0.89,
    },
    {
      id: 'adaptability',
      label: 'Adaptabilité',
      description: "Ajustement au contexte et au style de l'utilisateur",
      weight: 0.86,
    },
    {
      id: 'patience',
      label: 'Patience',
      description: 'Tolérance, absence de jugement hâtif',
      weight: 0.84,
    },
    {
      id: 'respect',
      label: 'Respect',
      description: 'Reconnaissance de la dignité et autonomie humaine',
      weight: 0.88,
    },
    {
      id: 'transparency',
      label: 'Transparence',
      description: 'Honnêteté sur capacités et limites',
      weight: 0.85,
    },
    {
      id: 'authenticity',
      label: 'Authenticité',
      description: 'Cohérence entre paroles et actions',
      weight: 0.82,
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      description: 'Co-construction, partenariat symétrique',
      weight: 0.8,
    },

    // ═══════════════════════════════════════════════════════════════
    // CLUSTER 3: CREATIVITY & INNOVATION (7 valeurs)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'creativity',
      label: 'Créativité',
      description: "Génération d'idées nouvelles, divergence",
      weight: 0.87,
    },
    {
      id: 'innovation',
      label: 'Innovation',
      description: 'Application pratique de la créativité',
      weight: 0.84,
    },
    {
      id: 'experimentation',
      label: 'Expérimentation',
      description: "Test d'hypothèses, exploration méthodique",
      weight: 0.82,
    },
    {
      id: 'risk_taking',
      label: 'Prise de risque calculée',
      description: 'Sortie de zone de confort, courage',
      weight: 0.75,
    },
    {
      id: 'imagination',
      label: 'Imagination',
      description: 'Visualisation de possibilités non-existantes',
      weight: 0.78,
    },
    {
      id: 'playfulness',
      label: 'Jeu',
      description: 'Légèreté, exploration sans contrainte',
      weight: 0.72,
    },
    {
      id: 'originality',
      label: 'Originalité',
      description: 'Refus du conformisme, perspective unique',
      weight: 0.76,
    },

    // ═══════════════════════════════════════════════════════════════
    // CLUSTER 4: ETHICS & RESPONSIBILITY (7 valeurs)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'responsibility',
      label: 'Responsabilité',
      description: 'Conscience des conséquences de ses actions',
      weight: 0.93,
    },
    {
      id: 'integrity',
      label: 'Intégrité',
      description: 'Alignement valeurs/actions, cohérence morale',
      weight: 0.9,
    },
    {
      id: 'justice',
      label: 'Justice',
      description: 'Équité, impartialité, absence de biais',
      weight: 0.88,
    },
    {
      id: 'benevolence',
      label: 'Bienveillance',
      description: "Intention de faire le bien, d'aider",
      weight: 0.86,
    },
    {
      id: 'privacy',
      label: 'Vie privée',
      description: 'Protection des données personnelles',
      weight: 0.92,
    },
    {
      id: 'security',
      label: 'Sécurité',
      description: 'Protection contre les menaces',
      weight: 0.91,
    },
    {
      id: 'sustainability',
      label: 'Durabilité',
      description: 'Pérennité, impact long-terme positif',
      weight: 0.79,
    },
  ],
};

/**
 * Valide structure d'une IdentityMatrix
 * @param matrix Matrice à valider
 * @returns true si valide, false sinon
 */
export function validateIdentityMatrix(matrix: unknown): matrix is IdentityMatrix {
  if (!matrix || typeof matrix !== 'object') return false;

  // v24.7 - Type-safe access with type guard
  const m = matrix as Record<string, unknown>;
  if (!m.version || typeof m.version !== 'string') return false;
  if (!m.lastUpdated || typeof m.lastUpdated !== 'number') return false;
  if (!Array.isArray(m.values)) return false;

  for (const value of m.values) {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    if (!v.id || !v.label || !v.description || typeof v.weight !== 'number') {
      return false;
    }
    if (v.weight < 0 || v.weight > 1) return false;
  }

  return true;
}

/**
 * Charge IdentityMatrix depuis Tauri avec fallback sur DEFAULT
 * @returns IdentityMatrix (toujours définie)
 */
export async function loadIdentityMatrix(): Promise<{
  matrix: IdentityMatrix;
  isLoaded: boolean;
  isFallback: boolean;
}> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const loaded = await invoke<IdentityMatrix>('identity_get_matrix');

    if (validateIdentityMatrix(loaded)) {
      return {
        matrix: loaded,
        isLoaded: true,
        isFallback: false,
      };
    } else {
      console.warn('[TITANE∞] Identity matrix invalid structure, using default');
      return {
        matrix: DEFAULT_IDENTITY_MATRIX,
        isLoaded: false,
        isFallback: true,
      };
    }
  } catch (error) {
    console.error('[TITANE∞] Failed to load identity matrix:', error);
    return {
      matrix: DEFAULT_IDENTITY_MATRIX,
      isLoaded: false,
      isFallback: true,
    };
  }
}

/**
 * Sauvegarde IdentityMatrix via Tauri
 * @param matrix Matrice à sauvegarder
 */
export async function saveIdentityMatrix(matrix: IdentityMatrix): Promise<void> {
  if (!validateIdentityMatrix(matrix)) {
    throw new Error('Invalid identity matrix structure');
  }

  await tauriClient.identitySetMatrix({ matrix });
}

/**
 * Réinitialise IdentityMatrix au défaut
 */
export async function resetIdentityMatrix(): Promise<void> {
  await saveIdentityMatrix({
    ...DEFAULT_IDENTITY_MATRIX,
    lastUpdated: Date.now(),
  });
}
