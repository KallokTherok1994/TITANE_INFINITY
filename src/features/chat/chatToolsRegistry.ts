/**
 * TITANE∞ — Chat Tools Registry
 * Registre des outils/raccourcis disponibles dans le sélecteur d'outils chat.
 * Pure data — aucune dépendance React.
 */

export type ChatToolCategory = 'generate' | 'research' | 'reflect' | 'config';

export interface ChatTool {
  id: string;
  icon: string;
  label: string;
  description: string;
  category: ChatToolCategory;
  templateText: string;
  /** Si true, le message est envoyé automatiquement sans saisie supplémentaire */
  autoSend: boolean;
}

export const CHAT_TOOLS: ChatTool[] = [
  // ─── GÉNÉRER ──────────────────────────────────────────────────────────────
  {
    id: 'generate_file',
    icon: '📄',
    label: 'Générer un fichier',
    description: 'Crée un fichier (Python, TS, MD, JSON…)',
    category: 'generate',
    templateText: 'Génère un fichier [TYPE] : ',
    autoSend: false,
  },
  {
    id: 'generate_summary',
    icon: '📝',
    label: 'Générer un résumé',
    description: 'Résumé avancé et structuré de la conversation',
    category: 'generate',
    templateText:
      'Génère un résumé avancé et structuré de notre conversation, avec les points importants, les décisions et les informations clés.',
    autoSend: true,
  },
  {
    id: 'generate_report',
    icon: '📊',
    label: 'Générer un rapport',
    description: 'Rapport complet et approfondi de la conversation',
    category: 'generate',
    templateText:
      'Génère le rapport complet de notre conversation avec toutes les informations importantes, analyses et conclusions, de façon réfléchie et approfondie.',
    autoSend: true,
  },
  // ─── RECHERCHE & ANALYSE ─────────────────────────────────────────────────
  {
    id: 'web_search',
    icon: '🌐',
    label: 'Recherche internet',
    description: 'Analyse sources en ligne et génère un rapport',
    category: 'research',
    templateText: 'Effectue une recherche sur internet sur : ',
    autoSend: false,
  },
  {
    id: 'deep_study',
    icon: '🔬',
    label: 'Étude approfondie',
    description: 'Analyse complète (5 phases) de toutes les sources online',
    category: 'research',
    templateText: 'Effectue une étude approfondie sur : ',
    autoSend: false,
  },
  {
    id: 'analyze_site',
    icon: '🔍',
    label: 'Analyser un site',
    description: "Analyse complète d'un site web en totalité",
    category: 'research',
    templateText: 'Analyse le site https://',
    autoSend: false,
  },
  // ─── RÉFLEXION ────────────────────────────────────────────────────────────
  {
    id: 'deep_reflection',
    icon: '🧠',
    label: 'Réflexion approfondie',
    description: 'Analyse et réflexion approfondie sur la conversation',
    category: 'reflect',
    templateText:
      'RÉFLEXION APPROFONDIE — Analyse les informations de notre conversation et effectue une réflexion approfondie sur le sujet traité, en identifiant les enjeux, les axes d\'amélioration et les prochaines étapes.',
    autoSend: true,
  },
  {
    id: 'critical_analysis',
    icon: '💡',
    label: 'Analyse critique',
    description: 'Analyse critique et approfondie sur un sujet',
    category: 'reflect',
    templateText: 'Effectue une analyse critique et approfondie sur : ',
    autoSend: false,
  },
  // ─── CONFIGURATION ────────────────────────────────────────────────────────
  {
    id: 'save_prefs',
    icon: '💾',
    label: 'Enregistrer préférence',
    description: 'Modifie les instructions de façon permanente',
    category: 'config',
    templateText: 'Enregistre dans mes préférences : ',
    autoSend: false,
  },
  {
    id: 'quick_summary',
    icon: '⚡',
    label: 'Résumé express',
    description: 'Résumé ultra-court (5 points) pour lecture rapide',
    category: 'config',
    templateText:
      'Génère un résumé express en 5 points maximum de notre conversation pour lecture rapide.',
    autoSend: true,
  },
];

export const TOOL_CATEGORIES: Record<ChatToolCategory, { label: string; icon: string }> = {
  generate: { label: 'Générer', icon: '🔧' },
  research: { label: 'Recherche & Analyse', icon: '🌐' },
  reflect: { label: 'Réflexion', icon: '🧠' },
  config: { label: 'Configuration', icon: '⚙️' },
};

/** Ordre d'affichage des catégories dans le panel */
export const TOOL_CATEGORY_ORDER: ChatToolCategory[] = [
  'generate',
  'research',
  'reflect',
  'config',
];
