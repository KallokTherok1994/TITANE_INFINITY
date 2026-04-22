import titaneIdentityKernelDocument from '../../../data/knowledge_base/default/titane_identity_kernel_v31.json';

type TitaneIdentityKernelDocument = {
  category: string;
  version: string;
  description: string;
  titane_identity_kernel: {
    canonical_signature: string;
    core_function: string;
    mission: string;
    values: string[];
    conversation_contract: {
      tone: string[];
      default_shape: string[];
      response_floor: string;
      must_do: string[];
      must_not_do: string[];
    };
    runtime_doctrine: {
      golden_rule: string;
      priority_order: string[];
    };
    public_positioning: {
      promise: string;
      tagline: string;
      guardrails: string[];
    };
    persona_seed: {
      description: string;
      tone: string;
      pace: string;
      expression_style: string;
      signature_phrases: string[];
      traits: {
        formality: number;
        empathy: number;
        precision: number;
        creativity: number;
        assertiveness: number;
        warmth: number;
        humor: number;
      };
      style_preferences: {
        use_lists: boolean;
        use_examples: boolean;
        response_length: string;
        structure_level: string;
      };
    };
  };
};

const titaneIdentityKernel = titaneIdentityKernelDocument as TitaneIdentityKernelDocument;

export const TITANE_IDENTITY_KERNEL_CATEGORY = titaneIdentityKernel.category;
export const TITANE_IDENTITY_KERNEL_VERSION = titaneIdentityKernel.version;
export const TITANE_IDENTITY_KERNEL = titaneIdentityKernel.titane_identity_kernel;

export const TITANE_DEFAULT_PROMPT_BLOCK = [
  'PROFIL CANONIQUE ACTIF :',
  `• Signature: ${TITANE_IDENTITY_KERNEL.canonical_signature}`,
  `• Fonction centrale: ${TITANE_IDENTITY_KERNEL.core_function}`,
  `• Mission: ${TITANE_IDENTITY_KERNEL.mission}`,
  `• Ton: ${TITANE_IDENTITY_KERNEL.persona_seed.tone}`,
  `• Forme de reponse prioritaire: ${TITANE_IDENTITY_KERNEL.conversation_contract.default_shape.join(' -> ')}`,
  `• Regle d or: ${TITANE_IDENTITY_KERNEL.runtime_doctrine.golden_rule}`,
  `• Priorites runtime: ${TITANE_IDENTITY_KERNEL.runtime_doctrine.priority_order.join(' -> ')}`,
  `• Promesse publique: ${TITANE_IDENTITY_KERNEL.public_positioning.promise}`,
  '• Garde-fous memoire: ecrire seulement si signal stable, protecteur pour l axe futur et reutilisable; ne pas memoriser le rhetorique ni le passager.',
  `• Imperatifs: ${TITANE_IDENTITY_KERNEL.conversation_contract.must_do.join('; ')}`,
  `• Interdits: ${TITANE_IDENTITY_KERNEL.conversation_contract.must_not_do.join('; ')}`,
  `• Source structuree: ${TITANE_IDENTITY_KERNEL_CATEGORY}@${TITANE_IDENTITY_KERNEL_VERSION}`,
].join('\n');

export function buildTitaneIdentityPromptBlock(): string {
  return TITANE_DEFAULT_PROMPT_BLOCK;
}
