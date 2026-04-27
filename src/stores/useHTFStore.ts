// HTF Module — L'Humain à tout faire
// Store Zustand central

import { create } from 'zustand';
import type {
  HTFClient,
  HTFSubmission,
  HTFEstimation,
  HTFLearningEntry,
} from '../services/htf/types';
import { getAllClients } from '../services/htf/htfCrmService';
import { getAllSubmissions } from '../services/htf/htfSubmissionService';
import { getAllLearningEntries } from '../services/htf/htfLearningService';

export type HTFWizardStep = 'description' | 'surface' | 'services' | 'options' | 'review';

interface HTFState {
  clients: HTFClient[];
  submissions: HTFSubmission[];
  learningData: HTFLearningEntry[];
  activeEstimation: HTFEstimation | null;
  activeClient: HTFClient | null;
  isGenerating: boolean;
  currentStep: HTFWizardStep;
  wizardDescription: string;
  wizardSurfaceM2: number | null;
}

interface HTFActions {
  loadAll: () => void;
  setActiveClient: (client: HTFClient | null) => void;
  setActiveEstimation: (est: HTFEstimation | null) => void;
  setIsGenerating: (v: boolean) => void;
  setCurrentStep: (step: HTFWizardStep) => void;
  setWizardDescription: (desc: string) => void;
  setWizardSurfaceM2: (m2: number | null) => void;
  addSubmission: (sub: HTFSubmission) => void;
  addClient: (client: HTFClient) => void;
  reset: () => void;
}

const initialState: HTFState = {
  clients: [],
  submissions: [],
  learningData: [],
  activeEstimation: null,
  activeClient: null,
  isGenerating: false,
  currentStep: 'description',
  wizardDescription: '',
  wizardSurfaceM2: null,
};

export const useHTFStore = create<HTFState & HTFActions>(set => ({
  ...initialState,

  loadAll: () => {
    set({
      clients: getAllClients(),
      submissions: getAllSubmissions(),
      learningData: getAllLearningEntries(),
    });
  },

  setActiveClient: client => set({ activeClient: client }),
  setActiveEstimation: est => set({ activeEstimation: est }),
  setIsGenerating: v => set({ isGenerating: v }),
  setCurrentStep: step => set({ currentStep: step }),
  setWizardDescription: desc => set({ wizardDescription: desc }),
  setWizardSurfaceM2: m2 => set({ wizardSurfaceM2: m2 }),

  addSubmission: sub => set(state => ({ submissions: [sub, ...state.submissions] })),

  addClient: client => set(state => ({ clients: [client, ...state.clients] })),

  reset: () => set({ ...initialState }),
}));
