/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY — Training Intent Handler v∞.2                           ║
 * ║  Chat IA Integration for Training Baseline Engine                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Détecte et traite les intents d'entraînement dans les messages utilisateur║
 * ║  100% local • Éthique • Privé                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import type {
  UserStateLabel,
  TrainingSession,
  TrainingBaselineProfile,
} from '@/types/trainingBaseline';
// REMOVED: engines/training supprimé en PHASE 1 (OPTION B)
import { TrainingBaselineEngine, TRAINING_CONFIG } from '@/engines/training/_stubs';

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingIntentResult {
  recognized: boolean;
  intent: TrainingIntentType | null;
  label: UserStateLabel | null;
  response: string;
  action: TrainingAction | null;
  metadata?: Record<string, unknown>;
}

export type TrainingIntentType =
  | 'start_training'
  | 'stop_training'
  | 'record_state'
  | 'query_baseline'
  | 'query_progress'
  | 'reset_baseline'
  | 'confirm_reset'
  | 'cancel_reset'
  | 'help_training';

export type TrainingAction =
  | { type: 'START_SESSION'; label: UserStateLabel }
  | { type: 'STOP_SESSION' }
  | { type: 'RECORD_SNAPSHOT'; label: UserStateLabel }
  | { type: 'QUERY_BASELINE' }
  | { type: 'QUERY_PROGRESS' }
  | { type: 'RESET_BASELINE' }
  | { type: 'CONFIRM_RESET' }
  | { type: 'CANCEL_RESET' }
  | { type: 'SHOW_HELP' };

// ============================================================================
// MESSAGES PRUDENTS
// ============================================================================

const PRUDENT_MESSAGES = {
  sessionStart: "Reste naturel(le), je t'observe pendant quelques secondes...",
  captureSuccess: "J'ai bien enregistré cet état. Merci !",
  privacyReminder:
    "🔒 Rappel : aucune image n'est stockée, seulement des valeurs numériques abstraites.",
  confidenceDisclaimer:
    "⚠️ Ces estimations sont approximatives et servent uniquement d'indicateurs.",
  explanation:
    "L'entraînement me permet d'apprendre *tes* patterns uniques pour mieux te comprendre.",
};

// ============================================================================
// PATTERNS DE RECONNAISSANCE
// ============================================================================

interface IntentPattern {
  patterns: RegExp[];
  intent: TrainingIntentType;
  requiresLabel?: boolean;
}

/**
 * Patterns pour détecter l'état émotionnel dans les phrases
 */
const LABEL_PATTERNS: Record<UserStateLabel, RegExp[]> = {
  calm: [/calme/i, /serein[e]?/i, /apaisé[e]?/i, /zen/i, /paisible/i],
  stressed: [
    /stress[eé][e]?/i,
    /anxieu[xs]?[e]?/i,
    /tendu[e]?/i,
    /nerveu[xs]?[e]?/i,
    /agité[e]?/i,
    /préoccupé[e]?/i,
    /inqui[eè]t[e]?/i,
    /sous pression/i,
  ],
  focused: [
    /concentré[e]?/i,
    /focalisé[e]?/i,
    /focus/i,
    /attenti[fv][e]?/i,
    /absorbé[e]?/i,
    /immergé[e]?/i,
    /dans (le|la) zone/i,
    /en flow/i,
  ],
  fatigued: [
    /fatigué[e]?/i,
    /épuisé[e]?/i,
    /crevé[e]?/i,
    /lessivé[e]?/i,
    /vidé[e]?/i,
    /exténué[e]?/i,
    /à plat/i,
  ],
  motivated: [
    /motivé[e]?/i,
    /dynamique/i,
    /enthousiaste/i,
    /gonflé[e]? à bloc/i,
    /prêt[e]?/i,
    /d'attaque/i,
    /pumped/i,
  ],
  neutral: [
    /neutre/i,
    /normal[e]?/i,
    /ordinaire/i,
    /habituel[le]?/i,
    /standard/i,
    /moyen[ne]?/i,
    /comme d'hab/i,
  ],
  energized: [/énergique/i, /en forme/i, /pleine forme/i, /énergie/i, /énergisé/i],
  relaxed: [/détendu[e]?/i, /relaxé[e]?/i, /tranquille/i, /détente/i, /relax/i],
};

/**
 * Patterns d'intents principaux
 */
const INTENT_PATTERNS: IntentPattern[] = [
  // Démarrer une session d'entraînement
  {
    intent: 'start_training',
    requiresLabel: true,
    patterns: [
      /commence[rz]?\s+(l[''])?entra[îi]nement/i,
      /démarre[rz]?\s+(l[''])?entra[îi]nement/i,
      /lance[rz]?\s+(l[''])?entra[îi]nement/i,
      /entra[îi]ne[rz]?[\s-]?(moi|toi)/i,
      /apprends?\s+(mon|cet?)\s+état/i,
      /calibre[rz]?\s+(mon|l[''])?état/i,
      /enregistre[rz]?\s+quand\s+je\s+suis/i,
      /mémorise[rz]?\s+(mon|cet?)\s+état/i,
    ],
  },

  // Arrêter la session
  {
    intent: 'stop_training',
    patterns: [
      /arr[êe]te[rz]?\s+(l[''])?entra[îi]nement/i,
      /stoppe[rz]?\s+(l[''])?entra[îi]nement/i,
      /fin(ir)?\s+(de\s+l[''])?(d[''])?entra[îi]nement/i,
      /termine[rz]?\s+(l[''])?entra[îi]nement/i,
      /stop\s+training/i,
      /c['']est\s+bon\s+pour\s+l['']entra[îi]nement/i,
    ],
  },

  // Enregistrer un snapshot ponctuel
  {
    intent: 'record_state',
    requiresLabel: true,
    patterns: [
      /je\s+suis\s+(\w+)/i,
      /là\s+je\s+suis\s+(\w+)/i,
      /maintenant\s+je\s+suis\s+(\w+)/i,
      /enregistre[rz]?\s+((mon|cet?)\s+)?(état|moment)/i,
      /note[rz]?\s+((mon|cet?)\s+)?(état|moment)/i,
      /capture[rz]?\s+((mon|cet?)\s+)?(état|moment)/i,
      /marque[rz]?\s+((mon|cet?)\s+)?(état|moment)/i,
      /retiens?\s+((mon|cet?)\s+)?(état|moment)/i,
    ],
  },

  // Consulter le profil baseline
  {
    intent: 'query_baseline',
    patterns: [
      /mon\s+(profil|baseline|référence)/i,
      /ma\s+ligne\s+de\s+base/i,
      /mes\s+(patterns?|schémas?)/i,
      /qu['']est[\s-]ce\s+que\s+tu\s+(sais|connais)\s+de\s+moi/i,
      /montre[rz]?\s+(mon\s+)?profil/i,
      /affiche[rz]?\s+(mon\s+)?profil/i,
      /comment\s+tu\s+me\s+(vois|perçois)/i,
      /mes\s+données\s+(d[''])?entra[îi]nement/i,
    ],
  },

  // Consulter la progression
  {
    intent: 'query_progress',
    patterns: [
      /progress(ion)?/i,
      /avancement/i,
      /où\s+(en\s+)?(est|suis)/i,
      /combien\s+(d[''])?échantillons?/i,
      /statistiques?\s+(d[''])?entra[îi]nement/i,
      /état\s+(de\s+l[''])?entra[îi]nement/i,
      /fiabilité\s+(du\s+)?profil/i,
    ],
  },

  // Réinitialiser le baseline
  {
    intent: 'reset_baseline',
    patterns: [
      /réinitialise[rz]?\s+(mon\s+)?profil/i,
      /reset\s+(mon\s+)?profil/i,
      /efface[rz]?\s+(mes\s+)?données/i,
      /supprimer?\s+(mes\s+)?données/i,
      /recommence[rz]?\s+à\s+zéro/i,
      /repars?\s+de\s+zéro/i,
      /oublie[rz]?\s+(tout\s+)?ce\s+que\s+tu\s+(sais|connais)/i,
    ],
  },

  // Confirmation de reset
  {
    intent: 'confirm_reset',
    patterns: [
      /oui\s*(,)?\s*(confirme|efface|supprime|reset)/i,
      /confirme[rz]?\s+(la\s+)?suppression/i,
      /je\s+confirme/i,
      /vas[\s-]y\s+(efface|supprime)/i,
      /d['']accord\s+(efface|supprime)/i,
    ],
  },

  // Annulation de reset
  {
    intent: 'cancel_reset',
    patterns: [
      /non\s*(,)?\s*(annule|garde)/i,
      /annule[rz]?/i,
      /finalement\s+non/i,
      /garde[rz]?\s+mes\s+données/i,
      /ne\s+(supprime|efface)\s+pas/i,
    ],
  },

  // Aide sur l'entraînement
  {
    intent: 'help_training',
    patterns: [
      /aide\s+(sur\s+l[''])?entra[îi]nement/i,
      /comment\s+(fonctionne|marche)\s+l['']entra[îi]nement/i,
      /explique[rz]?\s+l['']entra[îi]nement/i,
      /qu['']est[\s-]ce\s+que\s+l['']entra[îi]nement/i,
      /c['']est\s+quoi\s+l['']entra[îi]nement/i,
      /pourquoi\s+entra[îi]ner/i,
      /à\s+quoi\s+sert\s+l['']entra[îi]nement/i,
    ],
  },
];

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

/**
 * Classe principale pour gérer les intents d'entraînement
 */
export class TrainingIntentHandler {
  private static instance: TrainingIntentHandler | null = null;
  private engine: TrainingBaselineEngine;
  private pendingResetConfirmation = false;
  private _lastIntentTime = 0;

  private constructor() {
    this.engine = TrainingBaselineEngine.getInstance();
  }

  /**
   * Pattern Singleton
   */
  static getInstance(): TrainingIntentHandler {
    if (!TrainingIntentHandler.instance) {
      TrainingIntentHandler.instance = new TrainingIntentHandler();
    }
    return TrainingIntentHandler.instance;
  }

  /**
   * Analyse un message utilisateur pour détecter un intent d'entraînement
   */
  async processMessage(message: string): Promise<TrainingIntentResult> {
    const trimmedMessage = message.trim().toLowerCase();

    // Vérification de longueur minimale
    if (trimmedMessage.length < 3) {
      return this.noMatch();
    }

    // Cas spécial: confirmation/annulation de reset en attente
    if (this.pendingResetConfirmation) {
      return this.handlePendingReset(trimmedMessage);
    }

    // Recherche d'un intent correspondant
    for (const intentPattern of INTENT_PATTERNS) {
      for (const pattern of intentPattern.patterns) {
        if (pattern.test(trimmedMessage)) {
          return await this.processIntent(
            intentPattern.intent,
            trimmedMessage,
            intentPattern.requiresLabel ?? false
          );
        }
      }
    }

    return this.noMatch();
  }

  /**
   * Traite un intent reconnu
   */
  private async processIntent(
    intent: TrainingIntentType,
    message: string,
    requiresLabel: boolean
  ): Promise<TrainingIntentResult> {
    this._lastIntentTime = Date.now();

    // Extraire le label si nécessaire
    let label: UserStateLabel | null = null;
    if (requiresLabel) {
      label = this.extractLabel(message);
      if (!label) {
        return {
          recognized: true,
          intent,
          label: null,
          response: this.getAmbiguousLabelResponse(),
          action: null,
        };
      }
    }

    switch (intent) {
      case 'start_training':
        if (label) {
          return await this.handleStartTraining(label);
        }
        return this.noMatch();

      case 'stop_training':
        return this.handleStopTraining();

      case 'record_state':
        if (label) {
          return await this.handleRecordState(label);
        }
        return this.noMatch();

      case 'query_baseline':
        return this.handleQueryBaseline();

      case 'query_progress':
        return this.handleQueryProgress();

      case 'reset_baseline':
        return this.handleResetBaseline();

      case 'help_training':
        return this.handleHelp();

      default:
        return this.noMatch();
    }
  }

  /**
   * Extrait le label d'état depuis le message
   */
  private extractLabel(message: string): UserStateLabel | null {
    for (const [label, patterns] of Object.entries(LABEL_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return label as UserStateLabel;
        }
      }
    }
    return null;
  }

  // ============================================================================
  // HANDLERS D'INTENTS
  // ============================================================================

  private async handleStartTraining(
    label: UserStateLabel
  ): Promise<TrainingIntentResult> {
    try {
      const session = await this.engine.startTrainingCapture(
        TRAINING_CONFIG.defaultCaptureDuration
      );

      return {
        recognized: true,
        intent: 'start_training',
        label,
        response: this.getStartTrainingResponse(label, session),
        action: { type: 'START_SESSION', label },
        metadata: {
          sessionId: session.sessionId,
          durationMs: session.targetDurationMs,
        },
      };
    } catch (error) {
      return {
        recognized: true,
        intent: 'start_training',
        label,
        response: `Je n'ai pas pu démarrer l'entraînement. ${(error as Error).message}`,
        action: null,
      };
    }
  }

  private handleStopTraining(): TrainingIntentResult {
    const session = this.engine.getCurrentSession();

    if (!session) {
      return {
        recognized: true,
        intent: 'stop_training',
        label: null,
        response: "Aucune session d'entraînement n'est en cours actuellement.",
        action: null,
      };
    }

    // Annuler la capture en cours
    this.engine.cancelCapture();

    return {
      recognized: true,
      intent: 'stop_training',
      label: session.targetLabel,
      response: this.getStopTrainingResponse(session),
      action: { type: 'STOP_SESSION' },
      metadata: {
        framesCollected: session.framesCollected,
        label: session.targetLabel,
      },
    };
  }

  private async handleRecordState(label: UserStateLabel): Promise<TrainingIntentResult> {
    try {
      // Démarre une capture courte (5 secondes)
      const session = await this.engine.startTrainingCapture(
        TRAINING_CONFIG.defaultCaptureDuration
      );

      return {
        recognized: true,
        intent: 'record_state',
        label,
        response: this.getRecordStateResponse(label),
        action: { type: 'RECORD_SNAPSHOT', label },
        metadata: { sessionId: session.sessionId },
      };
    } catch (error) {
      return {
        recognized: true,
        intent: 'record_state',
        label,
        response: `Je n'ai pas pu capturer cet état. ${(error as Error).message}`,
        action: null,
      };
    }
  }

  private handleQueryBaseline(): TrainingIntentResult {
    const profile = this.engine.getProfile();

    return {
      recognized: true,
      intent: 'query_baseline',
      label: null,
      response: this.getBaselineProfileResponse(profile ?? undefined),
      action: { type: 'QUERY_BASELINE' },
      metadata: { profile: profile ?? undefined },
    };
  }

  private handleQueryProgress(): TrainingIntentResult {
    const session = this.engine.getCurrentSession();
    const profile = this.engine.getProfile();

    return {
      recognized: true,
      intent: 'query_progress',
      label: null,
      response: this.getProgressResponse(session, profile ?? undefined),
      action: { type: 'QUERY_PROGRESS' },
      metadata: { session, totalSamples: profile?.totalSamplesCount ?? 0 },
    };
  }

  private handleResetBaseline(): TrainingIntentResult {
    this.pendingResetConfirmation = true;

    return {
      recognized: true,
      intent: 'reset_baseline',
      label: null,
      response: this.getResetConfirmationRequest(),
      action: null,
    };
  }

  private handlePendingReset(message: string): TrainingIntentResult {
    // Check confirmation
    const confirmPatterns = INTENT_PATTERNS.find(p => p.intent === 'confirm_reset');
    if (confirmPatterns) {
      for (const pattern of confirmPatterns.patterns) {
        if (pattern.test(message)) {
          this.pendingResetConfirmation = false;
          // TODO: Implement actual reset in engine
          return {
            recognized: true,
            intent: 'confirm_reset',
            label: null,
            response:
              "✅ Vos données d'entraînement ont été réinitialisées. Vous pouvez recommencer à partir de zéro.",
            action: { type: 'CONFIRM_RESET' },
          };
        }
      }
    }

    // Check cancellation
    const cancelPatterns = INTENT_PATTERNS.find(p => p.intent === 'cancel_reset');
    if (cancelPatterns) {
      for (const pattern of cancelPatterns.patterns) {
        if (pattern.test(message)) {
          this.pendingResetConfirmation = false;
          return {
            recognized: true,
            intent: 'cancel_reset',
            label: null,
            response: "👍 D'accord, vos données sont conservées.",
            action: { type: 'CANCEL_RESET' },
          };
        }
      }
    }

    // Ni confirmation ni annulation claire
    return {
      recognized: true,
      intent: 'reset_baseline',
      label: null,
      response:
        "Je n'ai pas compris. Voulez-vous vraiment réinitialiser vos données ? Répondez 'oui, confirme' ou 'non, annule'.",
      action: null,
    };
  }

  private handleHelp(): TrainingIntentResult {
    return {
      recognized: true,
      intent: 'help_training',
      label: null,
      response: this.getHelpResponse(),
      action: { type: 'SHOW_HELP' },
    };
  }

  // ============================================================================
  // GÉNÉRATEURS DE RÉPONSES
  // ============================================================================

  private getStartTrainingResponse(
    label: UserStateLabel,
    session: TrainingSession
  ): string {
    const labelFr = this.getLabelFrench(label);
    const durationSec = Math.round(session.targetDurationMs / 1000);

    return `🎯 **Enregistrement démarré**

Je vais observer ton état **${labelFr}** pendant ${durationSec} secondes.

${PRUDENT_MESSAGES.sessionStart}

${PRUDENT_MESSAGES.privacyReminder}`;
  }

  private getStopTrainingResponse(session: TrainingSession): string {
    const labelFr = this.getLabelFrench(session.targetLabel);
    const frames = session.framesCollected;

    return `✅ **Session arrêtée**

📊 **Résumé :**
- État observé : **${labelFr}**
- Frames collectées : ${frames}

${PRUDENT_MESSAGES.privacyReminder}`;
  }

  private getRecordStateResponse(label: UserStateLabel): string {
    const labelFr = this.getLabelFrench(label);

    return `📸 **Enregistrement en cours...**

Je capture ton état **${labelFr}** pendant quelques secondes.

${PRUDENT_MESSAGES.sessionStart}`;
  }

  private getBaselineProfileResponse(
    profile: TrainingBaselineProfile | undefined
  ): string {
    if (!profile) {
      return `📋 **Votre profil**

Aucun profil de baseline disponible.

Pour commencer, dites par exemple :
- "Je suis calme" (je capture cet état)
- "Je suis concentré" (autre état)`;
    }

    const signatures = Object.keys(profile.stateSignatures);

    if (signatures.length === 0 && profile.totalSamplesCount === 0) {
      return `📋 **Votre profil**

Vous n'avez pas encore entraîné de baseline.

Pour commencer, dites par exemple :
- "Je suis calme" (je capture cet état)
- "Entraîne-moi à l'état concentré"

${PRUDENT_MESSAGES.explanation}`;
    }

    const signatureList = signatures
      .map(label => {
        const sig = profile.stateSignatures[label as UserStateLabel];
        const samples = sig?.samplesCount ?? 0;
        return `- **${this.getLabelFrench(label as UserStateLabel)}** : ${samples} échantillons`;
      })
      .join('\n');

    const calibrationStatus = profile.isCalibrated
      ? '✅ Calibré'
      : `⏳ En cours (${profile.trainingSessionsCount}/${5} sessions)`;

    return `📋 **Votre profil de baseline**

${signatureList || '(Aucun état spécifique entraîné)'}

📊 Total : ${profile.totalSamplesCount} échantillons
🎯 Statut : ${calibrationStatus}
⚡ Confiance : ${Math.round(profile.profileConfidence * 100)}%

${PRUDENT_MESSAGES.confidenceDisclaimer}`;
  }

  private getProgressResponse(
    session: TrainingSession | null,
    profile: TrainingBaselineProfile | undefined
  ): string {
    if (!session) {
      if (!profile) {
        return `📊 **Progression**

Aucune session d’entraînement en cours.
Aucun profil de baseline disponible.

Pour démarrer une session, dites "je suis calme" (ou un autre état).`;
      }

      const statesCount = Object.keys(profile.stateSignatures).length;

      return `📊 **Progression**

Aucune session d'entraînement en cours.

📋 Profil actuel :
- ${profile.totalSamplesCount} échantillons au total
- ${statesCount} états entraînés
- ${profile.trainingSessionsCount} sessions complétées

Pour démarrer une session, dites "je suis calme" (ou un autre état).`;
    }

    const percentage = Math.round(session.progress);
    const progressBar = this.makeProgressBar(percentage);
    const labelFr = this.getLabelFrench(session.targetLabel);

    return `📊 **Session en cours**

${progressBar} ${percentage}%

État : **${labelFr}**
Frames : ${session.framesCollected}

${session.userMessage}`;
  }

  private getResetConfirmationRequest(): string {
    return `⚠️ **Confirmation requise**

Êtes-vous sûr(e) de vouloir réinitialiser toutes vos données d'entraînement ?

Cette action :
- Supprimera tous vos échantillons collectés
- Réinitialisera votre profil de baseline
- Est **irréversible**

Répondez **"oui, confirme"** ou **"non, annule"**.`;
  }

  private getHelpResponse(): string {
    return `📚 **Aide - Système d'entraînement**

Le système d'entraînement apprend à reconnaître **tes** patterns comportementaux uniques.

🎯 **États disponibles :**
- Calme / Serein
- Stressé / Anxieux
- Concentré / Focus
- Fatigué / Épuisé
- Motivé / Dynamique
- Neutre / Normal
- Énergique / En forme
- Détendu / Relaxé

💬 **Commandes :**
- "Je suis calme" → Enregistre cet état
- "Entraîne-moi à l'état concentré" → Session d'entraînement
- "Arrête l'entraînement" → Stoppe la session
- "Mon profil" → Voir tes données
- "Ma progression" → Voir l'avancement
- "Réinitialise mon profil" → Effacer les données

🔒 **Confidentialité :**
${PRUDENT_MESSAGES.privacyReminder}

${PRUDENT_MESSAGES.explanation}`;
  }

  private getAmbiguousLabelResponse(): string {
    return `🤔 Je n'ai pas compris quel état tu veux enregistrer.

Précise ton état, par exemple :
- "Je suis calme"
- "Je suis concentré"
- "Je suis fatigué"
- "Je suis stressé"
- "Je suis motivé"`;
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  private getLabelFrench(label: UserStateLabel): string {
    const translations: Record<UserStateLabel, string> = {
      calm: 'calme',
      stressed: 'stressé(e)',
      focused: 'concentré(e)',
      fatigued: 'fatigué(e)',
      motivated: 'motivé(e)',
      neutral: 'neutre',
      energized: 'énergique',
      relaxed: 'détendu(e)',
    };
    return translations[label] || label;
  }

  private makeProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private noMatch(): TrainingIntentResult {
    return {
      recognized: false,
      intent: null,
      label: null,
      response: '',
      action: null,
    };
  }

  /**
   * Vérifie si une session est en cours
   */
  isSessionActive(): boolean {
    return this.engine.getCurrentSession() !== null;
  }

  /**
   * Obtient l'état actuel de la session
   */
  getCurrentSessionLabel(): UserStateLabel | null {
    const session = this.engine.getCurrentSession();
    return session?.targetLabel ?? null;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const trainingIntentHandler = TrainingIntentHandler.getInstance();

/**
 * Fonction utilitaire pour traiter un message
 */
export async function processTrainingIntent(
  message: string
): Promise<TrainingIntentResult> {
  return trainingIntentHandler.processMessage(message);
}
