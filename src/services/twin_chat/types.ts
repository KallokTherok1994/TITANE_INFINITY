export type TwinChatObservationKind = 'value' | 'cognitive' | 'style' | 'emotional';

export type TwinChatObservationRisk = 'low' | 'medium' | 'identity_sensitive';

export type TwinChatObservationStatus = 'shadow';

export interface TwinChatObservationCandidate {
  id: string;
  kind: TwinChatObservationKind;
  contentCompact: string;
  context: string;
  confidence: number;
  evidenceSource: 'chat_turn';
  consentRisk: TwinChatObservationRisk;
  status: TwinChatObservationStatus;
  canWriteTwin: false;
  route: string | null;
  moduleId: string | null;
}

export interface TwinChatShadowSummary {
  candidateCount: number;
  kinds: TwinChatObservationKind[];
  verdictCounts?: Partial<Record<TwinChatPolicyVerdict, number>>;
}

export type TwinChatPolicyVerdict =
  | 'allowed'
  | 'review_required'
  | 'blocked'
  | 'downgraded';

export interface TwinChatPolicyDecision {
  candidateId: string;
  verdict: TwinChatPolicyVerdict;
  observationType: string;
  validationStatus: string;
  riskLevel: string;
  canWriteTwin: false;
  requiresKevinValidation: boolean;
}

export interface TwinChatOrchestrationResult {
  decisions: TwinChatPolicyDecision[];
  summary: TwinChatShadowSummary;
}

export type TwinChatReviewWriteStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'failed';

export interface TwinChatReviewItem {
  id: string;
  candidate: TwinChatObservationCandidate;
  decision: TwinChatPolicyDecision;
  recordedAt: string;
  lastSeenAt: string;
  reviewedAt?: string;
  syncId?: string;
  writeStatus: TwinChatReviewWriteStatus;
  writeError?: string;
}

export interface TwinChatExtractionInput {
  message: string;
  route?: string | null;
  moduleId?: string | null;
}