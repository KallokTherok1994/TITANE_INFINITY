// HTF Module — L'Humain à tout faire
// Kevin Thibault — Types partagés entre services et composants

export interface HTFClient {
  id: string;
  nom: string;
  courriel?: string;
  telephone?: string;
  adresse?: string;
  dateCreation: string;
  nbSoumissions: number;
  noteInterne?: string;
}

export interface HTFEstimationItem {
  code: string;
  description: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  total: number;
  type: 'materiau' | 'main_oeuvre' | 'deplacement' | 'autre';
  niveau?: 'T1' | 'T2' | 'T3';
  heures?: number;
}

export interface HTFImplementationStep {
  ordre: number;
  titre: string;
  description: string;
  dureeEstimeeH: number;
  niveau: 'T1' | 'T2' | 'T3';
  materiauxNecessaires?: string[];
}

export type HTFMajoration = {
  type:
    | 'urgence_24h'
    | 'urgence_4h'
    | 'acces_difficile'
    | 'fin_semaine'
    | 'ferie'
    | 'hauteur'
    | 'materiaux_speciaux';
  multiplicateur: number;
  description: string;
};

export interface HTFEstimation {
  id: string;
  numero: string; // format S{AAAA}{MM}-{NNN}
  clientId?: string;
  clientNom?: string;
  dateCreation: string;
  dateValidite: string; // +30 jours
  descriptionProjet: string;
  surfaceM2?: number;
  items: HTFEstimationItem[];
  majorations: HTFMajoration[];
  planMiseEnOeuvre: HTFImplementationStep[];
  sousTotal: number;
  tps: number;
  tvq: number;
  totalAvecTaxes: number;
  statut: 'brouillon' | 'envoyee' | 'acceptee' | 'refusee' | 'expiree';
  notes?: string;
  photosAnalysees?: string[];
}

export interface HTFSubmission extends HTFEstimation {
  clientSignature?: string;
  dateAcceptation?: string;
  acompteRecu?: number;
  dateCompletion?: string;
  coutReel?: number;
  satisfactionClient?: number; // 1-5
}

export interface HTFLearningEntry {
  id: string;
  soumissionId: string;
  typeService: string;
  surfaceM2?: number;
  coutEstime: number;
  coutReel: number;
  heuresEstimees: number;
  heuresReelles: number;
  facteurCorrection: number; // coutReel / coutEstime
  date: string;
  notes?: string;
}

export interface HTFKnowledgeContext {
  identity: Record<string, unknown>;
  formationManuel: Record<string, unknown>;
  estimationRules: Record<string, unknown>;
  servicesCatalogue: Record<string, unknown>;
  soumissionTemplate: Record<string, unknown>;
}
