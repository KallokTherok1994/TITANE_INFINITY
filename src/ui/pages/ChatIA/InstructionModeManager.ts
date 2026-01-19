// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ - Instruction Modes Manager
// ═══════════════════════════════════════════════════════════════════════════
// Gestion des modes d'instructions personnalisés pour Chat IA
// ═══════════════════════════════════════════════════════════════════════════

export interface InstructionMode {
  id: string;
  name: string;
  icon: string;
  systemPrompt: string;
  description: string;
  isCustom: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODES PAR DÉFAUT
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MODES: InstructionMode[] = [
  {
    id: 'assistant',
    name: 'Assistant Général',
    icon: '🤖',
    systemPrompt: `Tu es TITANE∞, un assistant IA avancé créé par l'équipe TITANE.
Tu réponds TOUJOURS en français, de manière claire, concise et utile.
Tu es amical, professionnel et tu aides l'utilisateur avec ses questions.
Tu fournis des réponses complètes et bien structurées.`,
    description: 'Assistant conversationnel général',
    isCustom: false,
  },
  {
    id: 'programmer',
    name: 'Programmeur Expert',
    icon: '💻',
    systemPrompt: `Tu es un expert en programmation multilingue (Python, JavaScript, TypeScript, Rust, etc.).
Tu fournis du code propre, bien commenté et optimisé.
Tu expliques tes choix techniques et proposes des bonnes pratiques.
Tu réponds TOUJOURS en français avec des exemples de code commentés.
Format: Explication + Code + Tests si pertinent.`,
    description: 'Spécialiste code et développement',
    isCustom: false,
  },
  {
    id: 'teacher',
    name: 'Professeur Pédagogue',
    icon: '👨‍🏫',
    systemPrompt: `Tu es un professeur pédagogue excellent dans l'explication de concepts complexes.
Tu simplifies les notions difficiles avec des analogies et des exemples concrets.
Tu structures tes réponses: 1) Introduction simple, 2) Explication détaillée, 3) Exemples, 4) Résumé.
Tu réponds TOUJOURS en français avec un ton encourageant et patient.
Tu vérifies la compréhension et proposes des exercices si pertinent.`,
    description: 'Explications pédagogiques détaillées',
    isCustom: false,
  },
  {
    id: 'creative',
    name: 'Créatif Littéraire',
    icon: '✍️',
    systemPrompt: `Tu es un écrivain créatif talentueux, maîtrisant tous les styles littéraires.
Tu rédiges des textes riches, imagés et captivants en français.
Tu adaptes ton style selon le contexte: poésie, récit, essai, script, etc.
Tu utilises un vocabulaire varié et des figures de style appropriées.
Tu fournis des créations originales et engageantes.`,
    description: 'Rédaction créative et littéraire',
    isCustom: false,
  },
  {
    id: 'analyst',
    name: 'Analyste Critique',
    icon: '🔍',
    systemPrompt: `Tu es un analyste critique rigoureux et méthodique.
Tu examines les informations avec objectivité et esprit critique.
Tu structures tes analyses: 1) Contexte, 2) Faits, 3) Analyse, 4) Conclusions, 5) Recommandations.
Tu identifies les biais, les lacunes et les points faibles.
Tu réponds TOUJOURS en français avec des arguments solides et sourcés.`,
    description: 'Analyse critique et méthodique',
    isCustom: false,
  },
  {
    id: 'concise',
    name: 'Expert Concis',
    icon: '⚡',
    systemPrompt: `Tu es un expert ultra-concis et direct.
Tu fournis des réponses courtes, précises et factuelles.
Format: Maximum 3-4 phrases par réponse, sauf si explicitement demandé.
Tu vas à l'essentiel sans fioritures.
Tu réponds TOUJOURS en français avec des puces si pertinent.`,
    description: 'Réponses courtes et directes',
    isCustom: false,
  },
  {
    id: 'scientist',
    name: 'Scientifique Rigoureux',
    icon: '🔬',
    systemPrompt: `Tu es un scientifique rigoureux et factuel.
Tu bases tes réponses sur des faits scientifiques établis.
Tu cites des sources et des études quand pertinent.
Tu utilises la méthode scientifique: hypothèse, observation, conclusion.
Tu réponds TOUJOURS en français avec rigueur et précision.
Tu admets les limites de tes connaissances.`,
    description: 'Approche scientifique rigoureuse',
    isCustom: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE MANAGER
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'titane_instruction_modes';

export class InstructionModeManager {
  private modes: InstructionMode[] = [];

  constructor() {
    this.loadModes();
  }

  // Charger modes depuis localStorage
  private loadModes(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customModes = JSON.parse(stored) as InstructionMode[];
        this.modes = [...DEFAULT_MODES, ...customModes];
      } else {
        this.modes = [...DEFAULT_MODES];
      }
    } catch (error) {
      console.error('Erreur chargement modes:', error);
      this.modes = [...DEFAULT_MODES];
    }
  }

  // Sauvegarder modes personnalisés
  private saveModes(): void {
    try {
      const customModes = this.modes.filter(m => m.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customModes));
    } catch (error) {
      console.error('Erreur sauvegarde modes:', error);
    }
  }

  // Obtenir tous les modes
  getAllModes(): InstructionMode[] {
    return [...this.modes];
  }

  // Obtenir un mode par ID
  getMode(id: string): InstructionMode | undefined {
    return this.modes.find(m => m.id === id);
  }

  // Créer un mode personnalisé
  createMode(
    name: string,
    icon: string,
    systemPrompt: string,
    description: string
  ): InstructionMode {
    const newMode: InstructionMode = {
      id: `custom_${Date.now()}`,
      name,
      icon,
      systemPrompt,
      description,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.modes.push(newMode);
    this.saveModes();
    return newMode;
  }

  // Mettre à jour un mode personnalisé
  updateMode(
    id: string,
    updates: Partial<Omit<InstructionMode, 'id' | 'isCustom' | 'createdAt'>>
  ): boolean {
    const mode = this.modes.find(m => m.id === id);
    if (!mode || !mode.isCustom) {
      return false; // Ne peut pas modifier modes par défaut
    }

    Object.assign(mode, {
      ...updates,
      updatedAt: Date.now(),
    });

    this.saveModes();
    return true;
  }

  // Dupliquer un mode (créer custom depuis défaut)
  duplicateMode(id: string, newName?: string): InstructionMode | null {
    const original = this.modes.find(m => m.id === id);
    if (!original) return null;

    return this.createMode(
      newName || `${original.name} (Copie)`,
      original.icon,
      original.systemPrompt,
      original.description
    );
  }

  // Supprimer un mode personnalisé
  deleteMode(id: string): boolean {
    const index = this.modes.findIndex(m => m.id === id && m.isCustom);
    if (index === -1) return false;

    this.modes.splice(index, 1);
    this.saveModes();
    return true;
  }

  // Exporter modes personnalisés (JSON)
  exportModes(): string {
    const customModes = this.modes.filter(m => m.isCustom);
    return JSON.stringify(customModes, null, 2);
  }

  // Importer modes personnalisés (JSON)
  importModes(jsonData: string): number {
    try {
      const imported = JSON.parse(jsonData) as InstructionMode[];
      let count = 0;

      imported.forEach(mode => {
        if (mode.isCustom && !this.modes.find(m => m.id === mode.id)) {
          this.modes.push(mode);
          count++;
        }
      });

      if (count > 0) {
        this.saveModes();
      }

      return count;
    } catch (error) {
      console.error('Erreur import modes:', error);
      return 0;
    }
  }

  // Réinitialiser aux modes par défaut
  resetToDefaults(): void {
    this.modes = [...DEFAULT_MODES];
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Instance singleton
export const instructionModeManager = new InstructionModeManager();
