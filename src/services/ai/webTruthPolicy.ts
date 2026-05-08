export type WebTruthNeed =
  | 'not_needed'
  | 'freshness_required'
  | 'factual_verification_required'
  | 'user_requested_web'
  | 'source_required';

export type WebTruthStatus =
  | 'not_needed'
  | 'needed_not_attempted'
  | 'attempted_success'
  | 'attempted_no_sources'
  | 'unavailable'
  | 'failed'
  | 'blocked';

export interface WebTruthPolicyInput {
  userMessage: string;
  requiresFreshness?: boolean;
  citationsCount?: number;
  factualClaimsDetected?: boolean;
  webAttempted?: boolean;
  webAvailable?: boolean;
  blocked?: boolean;
  failureReasonCode?: string;
}

export interface WebTruthPolicyDecision {
  need: WebTruthNeed;
  status: WebTruthStatus;
  shouldUseWeb: boolean;
  shouldWarnUser: boolean;
  limitations: string[];
}

const USER_REQUESTED_WEB_PATTERNS = [
  /\b(web|internet|google|search|browse|source|sources|citation|citations)\b/i,
  /\b(look\s+up|check\s+online|verify\s+online|find\s+sources)\b/i,
  /\b(cherche|recherche|sur\s+internet|sur\s+le\s+web|sources?)\b/i,
];

const FRESHNESS_PATTERNS = [
  /\b(latest|recent|today|current|currently|this week|this month|breaking)\b/i,
  /\b(aujourd'hui|actuel|actuelle|r[ée]cent|derni[eè]re|derniers?|en\s+ce\s+moment)\b/i,
];

const SOURCE_REQUIRED_PATTERNS = [
  /\b(cite|citation|citations|source|sources|reference|references|proof|evidence)\b/i,
  /\b(source[s]?\s+required|with\s+sources?)\b/i,
  /\b(avec\s+sources?|cite\s+tes\s+sources?)\b/i,
];

export function evaluateWebTruthPolicy(
  input: WebTruthPolicyInput,
): WebTruthPolicyDecision {
  const userMessage = input.userMessage ?? '';
  const citationsCount = input.citationsCount ?? 0;
  const requiresFreshness = Boolean(input.requiresFreshness);
  const factualClaimsDetected = Boolean(input.factualClaimsDetected);
  const webAttempted = Boolean(input.webAttempted);
  const webAvailable = Boolean(input.webAvailable);
  const blocked = Boolean(input.blocked);
  const normalizedFailure = (input.failureReasonCode ?? '').toLowerCase();

  const userRequestedWeb = USER_REQUESTED_WEB_PATTERNS.some(pattern =>
    pattern.test(userMessage),
  );
  const freshnessRequired =
    requiresFreshness || FRESHNESS_PATTERNS.some(pattern => pattern.test(userMessage));
  const sourceRequired = SOURCE_REQUIRED_PATTERNS.some(pattern => pattern.test(userMessage));

  let need: WebTruthNeed = 'not_needed';
  if (freshnessRequired) need = 'freshness_required';
  else if (sourceRequired) need = 'source_required';
  else if (userRequestedWeb) need = 'user_requested_web';
  else if (factualClaimsDetected) need = 'factual_verification_required';

  const shouldUseWeb = need !== 'not_needed';
  const limitations: string[] = [];

  let status: WebTruthStatus = 'not_needed';
  if (blocked) {
    status = 'blocked';
    limitations.push('web-blocked');
  } else if (!shouldUseWeb) {
    status = 'not_needed';
  } else if (!webAttempted) {
    status = 'needed_not_attempted';
    limitations.push('web-required-but-not-attempted');
  } else if (!webAvailable) {
    if (
      normalizedFailure.includes('blocked') ||
      normalizedFailure.includes('policy')
    ) {
      status = 'blocked';
      limitations.push('web-blocked');
    } else if (
      normalizedFailure.includes('unavailable') ||
      normalizedFailure.includes('offline')
    ) {
      status = 'unavailable';
      limitations.push('web-unavailable');
    } else {
      status = 'failed';
      limitations.push('web-attempt-failed');
    }
  } else if (citationsCount > 0) {
    status = 'attempted_success';
  } else {
    status = 'attempted_no_sources';
    limitations.push('web-attempted-without-sources');
  }

  return {
    need,
    status,
    shouldUseWeb,
    shouldWarnUser: shouldUseWeb && status !== 'attempted_success' && status !== 'not_needed',
    limitations,
  };
}
