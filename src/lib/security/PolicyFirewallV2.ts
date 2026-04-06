export type AttackCategoryV2 =
  | 'prompt_injection'
  | 'policy_bypass'
  | 'data_exfiltration'
  | 'secrets_disclosure'
  | 'benign';

export interface AttackSignalV2 {
  category: AttackCategoryV2;
  score: number;
  pattern: string;
}

export interface AttackModelResultV2 {
  category: AttackCategoryV2;
  confidence: number;
  signals: AttackSignalV2[];
}

export interface PolicyFirewallOptionsV2 {
  strictMode?: boolean;
  allowUrls?: boolean;
  allowedDomains?: string[];
}

export interface PolicyFirewallDecisionV2 {
  decision: 'allow' | 'deny';
  reasonCodes: string[];
  riskLevel: number;
}

export interface ExfilGuardResultV2 {
  blocked: boolean;
  redacted: string;
  redactions: string[];
  reasonCodes: string[];
}

const ATTACK_PATTERNS_V2: Record<Exclude<AttackCategoryV2, 'benign'>, RegExp[]> = {
  prompt_injection: [
    /ignore\s+(all|previous)\s+(instructions?|rules?)/gi,
    /disregard\s+(all|previous)\s+(prompts?|instructions?)/gi,
    /developer\s+mode|god\s+mode|dan\s+mode/gi,
  ],
  policy_bypass: [
    /bypass\s+(policy|guard|firewall|safety)/gi,
    /disable\s+(safety|guard|security|firewall)/gi,
    /run\s+without\s+checks?/gi,
  ],
  data_exfiltration: [
    /send\s+(all\s+)?(data|logs|memory|context)\s+to\s+https?:\/\//gi,
    /(curl|wget)\s+https?:\/\//gi,
    /upload\s+(secrets?|dump|database|memory)/gi,
  ],
  secrets_disclosure: [
    /reveal\s+(api[_\s-]?key|token|secret|password|private\s+key)/gi,
    /print\s+(system\s+prompt|hidden\s+instructions)/gi,
    /show\s+all\s+environment\s+variables/gi,
  ],
};

const SECRET_VALUE_PATTERNS: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /sk-[A-Za-z0-9]{16,}/g, tag: 'OPENAI_KEY' },
  { pattern: /ghp_[A-Za-z0-9]{20,}/g, tag: 'GITHUB_TOKEN' },
  {
    pattern:
      /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,
    tag: 'PRIVATE_KEY',
  },
  { pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi, tag: 'GENERIC_API_KEY' },
];

export function evaluateAttackModelV2(input: string): AttackModelResultV2 {
  const signals: AttackSignalV2[] = [];

  for (const [category, patterns] of Object.entries(ATTACK_PATTERNS_V2) as Array<
    [Exclude<AttackCategoryV2, 'benign'>, RegExp[]]
  >) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        signals.push({
          category,
          score:
            category === 'data_exfiltration' || category === 'secrets_disclosure'
              ? 1
              : 0.8,
          pattern: pattern.source,
        });
      }
    }
  }

  if (signals.length === 0) {
    return {
      category: 'benign',
      confidence: 1,
      signals,
    };
  }

  const byCategory = new Map<AttackCategoryV2, number>();
  for (const signal of signals) {
    byCategory.set(
      signal.category,
      (byCategory.get(signal.category) ?? 0) + signal.score
    );
  }

  const sorted = [...byCategory.entries()].sort((left, right) => right[1] - left[1]);
  const top = sorted[0];
  const second = sorted[1];
  const confidence = top ? top[1] / (top[1] + (second?.[1] ?? 0)) : 0;

  return {
    category: top?.[0] ?? 'benign',
    confidence,
    signals,
  };
}

export function evaluatePolicyFirewallV2(
  input: string,
  options: PolicyFirewallOptionsV2 = {}
): PolicyFirewallDecisionV2 {
  const attackModel = evaluateAttackModelV2(input);
  const reasonCodes: string[] = [];

  let riskLevel = 0;

  if (attackModel.category !== 'benign') {
    reasonCodes.push(`ATTACK_MODEL_${attackModel.category.toUpperCase()}`);
    riskLevel = Math.max(riskLevel, attackModel.category === 'data_exfiltration' ? 5 : 4);
  }

  if (options.allowUrls === false && /https?:\/\//i.test(input)) {
    reasonCodes.push('URLS_NOT_ALLOWED');
    riskLevel = Math.max(riskLevel, 3);
  }

  const urls = extractUrls(input);
  if ((options.allowedDomains?.length ?? 0) > 0 && urls.length > 0) {
    const deniedUrl = urls.find(
      url => !isDomainAllowed(url, options.allowedDomains ?? [])
    );
    if (deniedUrl) {
      reasonCodes.push('ALLOWLIST_DENIED');
      riskLevel = Math.max(riskLevel, 5);
    }
  }

  const shouldDeny = riskLevel >= 5 || (Boolean(options.strictMode) && riskLevel >= 4);

  return {
    decision: shouldDeny ? 'deny' : 'allow',
    reasonCodes,
    riskLevel,
  };
}

export function applyExfilGuardsV2(
  input: string,
  strictMode = false
): ExfilGuardResultV2 {
  let redacted = input;
  const redactions: string[] = [];

  for (const { pattern, tag } of SECRET_VALUE_PATTERNS) {
    if (pattern.test(redacted)) {
      redacted = redacted.replace(pattern, `[REDACTED_${tag}]`);
      redactions.push(tag);
    }
  }

  const policy = evaluatePolicyFirewallV2(redacted, { strictMode, allowUrls: true });
  const blocked = policy.decision === 'deny' && strictMode;

  return {
    blocked,
    redacted,
    redactions,
    reasonCodes: policy.reasonCodes,
  };
}

function extractUrls(input: string): string[] {
  const matches = input.match(/https?:\/\/[^\s)\]}"']+/gi);
  return matches ?? [];
}

function isDomainAllowed(urlValue: string, allowedDomains: string[]): boolean {
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase();
    return allowedDomains.some(domain => {
      const normalized = domain.toLowerCase();
      return hostname === normalized || hostname.endsWith(`.${normalized}`);
    });
  } catch {
    return false;
  }
}
