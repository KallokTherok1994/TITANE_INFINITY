/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ — RESEARCH PAGE (Ring 4 / UI)
 *   P7.0 — UI intégration complète WebResearch Engine
 *   Tauri-only bridge — zero fetch direct — zero réseau UI
 *   Sections: Question · Mode · Answer · Sources · Limitations · Trace
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { webResearch } from '@/services/webResearchService';
import { userPreferencesEngine } from '@/services/userPreferencesEngine';
import type {
  ResearchMode,
  ResearchOptions,
  ResearchReport,
  Citation,
} from '@/types/research';

type ResearchHandoffState = {
  q?: string;
  mode?: ResearchMode;
  target_url?: string;
  seed_urls?: string[] | string;
  sandbox_root?: string;
};

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

type ResearchState = 'idle' | 'running' | 'done' | 'error';

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function modeLabel(mode: ResearchMode): string {
  switch (mode) {
    case 'OFFLINE':
      return '📴 OFFLINE (local index only)';
    case 'LOCAL_INDEX':
      return '🗄️ LOCAL INDEX (BM25 lexical)';
    case 'WEB_LIVE':
      return '🌐 WEB LIVE (governed fetch)';
    default:
      return mode;
  }
}

function verdictClass(markers: string[]): string {
  if (markers.includes('VERDICT_PASS')) return 'rp-verdict-pass';
  if (markers.includes('VERDICT_BLOCKED')) return 'rp-verdict-blocked';
  if (markers.includes('VERDICT_FAIL')) return 'rp-verdict-fail';
  return 'rp-verdict-unknown';
}

function extractFirstUrl(input: string): string | null {
  const urlMatch = input.match(/https?:\/\/\S+/i);
  if (!urlMatch?.[0]) {
    return null;
  }
  return urlMatch[0].replace(/[),.;!?]+$/, '');
}

function buildDefaultWebSeeds(question: string): string[] {
  const normalized = question
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const slug = normalized.replace(/\s+/g, '_');
  const query = encodeURIComponent(normalized);
  return [
    `https://fr.wikipedia.org/wiki/${slug}`,
    `https://fr.wikipedia.org/w/index.php?search=${query}`,
    `https://fr.wiktionary.org/wiki/${slug}`,
    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
  ];
}

function resolveWebLiveTarget(
  question: string,
  targetUrl: string,
  seedUrls: string[] | null
): string | null {
  const explicitTarget = targetUrl.trim();
  if (explicitTarget.length > 0) {
    return explicitTarget;
  }

  if (seedUrls && seedUrls.length > 0) {
    return seedUrls[0] ?? null;
  }

  const detectedUrl = extractFirstUrl(question);
  if (detectedUrl) {
    return detectedUrl;
  }

  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) {
    return null;
  }

  const defaultSeeds = buildDefaultWebSeeds(normalizedQuestion);
  return defaultSeeds[0] ?? null;
}

function resolveWebLiveSeeds(
  question: string,
  seedUrls: string[] | null
): string[] | null {
  if (seedUrls && seedUrls.length > 0) {
    return seedUrls;
  }

  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) {
    return null;
  }

  const detectedUrl = extractFirstUrl(normalizedQuestion);
  if (detectedUrl) {
    return [detectedUrl];
  }

  return buildDefaultWebSeeds(normalizedQuestion);
}

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────

const CitationCard: React.FC<{ citation: Citation; index: number }> = ({
  citation,
  index,
}) => (
  <div className="rp-citation" data-testid={`citation-${index}`}>
    <span className="rp-citation-index">[{index + 1}]</span>
    <a
      href={citation.url}
      className="rp-citation-url"
      rel="noreferrer noopener"
      onClick={e => e.preventDefault()} // Tauri-only: no browser navigation
      title={citation.url}
    >
      {citation.url.length > 60 ? `${citation.url.slice(0, 57)}…` : citation.url}
    </a>
    {citation.excerpt && (
      <blockquote className="rp-citation-excerpt">
        &ldquo;{citation.excerpt}&rdquo;
      </blockquote>
    )}
    <div className="rp-citation-meta">
      {citation.locator_text && (
        <span className="rp-locator-text" data-testid={`locator-text-${index}`}>
          📍 {citation.locator_text}
        </span>
      )}
      {!citation.locator_text && citation.locator && (
        <span className="rp-locator">{citation.locator}</span>
      )}
      {citation.paragraph_index != null && (
        <span className="rp-para-idx">¶{citation.paragraph_index}</span>
      )}
      {citation.char_start != null && (
        <span className="rp-char-start">@{citation.char_start}</span>
      )}
      <span className="rp-accessed">accessed: {citation.accessed_at}</span>
    </div>
  </div>
);

const TracePanel: React.FC<{ report: ResearchReport }> = ({ report }) => {
  const [open, setOpen] = useState(false);
  const { trace } = report;
  return (
    <div className="rp-trace-section">
      <button
        className="rp-trace-toggle"
        onClick={() => setOpen(v => !v)}
        data-testid="trace-toggle"
        type="button"
      >
        {open ? '▲ Hide trace' : '▼ Show trace'} ({trace.markers.length} markers)
      </button>
      {open && (
        <div className="rp-trace-body" data-testid="trace-body">
          <div className="rp-trace-markers">
            <strong>Markers:</strong>
            <ul>
              {trace.markers.map((m, i) => (
                <li
                  key={i}
                  className={m.startsWith('VERDICT') ? 'rp-verdict-marker' : ''}
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
          {trace.budgets && Object.keys(trace.budgets).length > 0 && (
            <div className="rp-trace-budgets">
              <strong>Budgets:</strong>
              <ul>
                {Object.entries(trace.budgets).map(([k, v]) => (
                  <li key={k}>
                    <code>{k}</code>: {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trace.cache_events && trace.cache_events.length > 0 && (
            <div className="rp-trace-cache">
              <strong>
                Cache ({trace.cache_events.filter(e => e.kind === 'HIT').length} hits /{' '}
                {trace.cache_events.filter(e => e.kind === 'MISS').length} misses):
              </strong>
            </div>
          )}
          {trace.errors && trace.errors.length > 0 && (
            <div className="rp-trace-errors">
              <strong>Errors:</strong>
              <ul>
                {trace.errors.map((e, i) => (
                  <li key={i} className="rp-error-item">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trace.index_events && (
            <div className="rp-trace-index">
              <strong>Index events:</strong>
              <pre className="rp-trace-pre">
                {JSON.stringify(trace.index_events, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────

export const ResearchPage: React.FC = () => {
  const location = useLocation();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<ResearchMode>('LOCAL_INDEX');
  const [targetUrl, setTargetUrl] = useState('');
  const [seedUrlsRaw, setSeedUrlsRaw] = useState('');
  const [sandboxRoot, setSandboxRoot] = useState('data/research');
  const [state, setState] = useState<ResearchState>('idle');
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const navState = (location.state as ResearchHandoffState | null) ?? null;
    const params = new URLSearchParams(location.search);
    const queryQuestion = navState?.q ?? params.get('q');
    const queryMode = navState?.mode ?? params.get('mode');
    const queryTargetUrl = navState?.target_url ?? params.get('target_url');
    const querySeedUrls =
      typeof navState?.seed_urls === 'string'
        ? navState.seed_urls
        : Array.isArray(navState?.seed_urls)
          ? navState.seed_urls.join('\n')
          : params.get('seed_urls');
    const querySandboxRoot = navState?.sandbox_root ?? params.get('sandbox_root');

    if (queryQuestion && queryQuestion.trim().length > 0) {
      setQuestion(queryQuestion.trim());
    }

    if (
      queryMode === 'OFFLINE' ||
      queryMode === 'LOCAL_INDEX' ||
      queryMode === 'WEB_LIVE'
    ) {
      setMode(queryMode);
    }

    if (queryTargetUrl && queryTargetUrl.trim().length > 0) {
      setTargetUrl(queryTargetUrl.trim());
    }

    if (querySeedUrls && querySeedUrls.trim().length > 0) {
      setSeedUrlsRaw(querySeedUrls.trim());
    }

    if (querySandboxRoot && querySandboxRoot.trim().length > 0) {
      setSandboxRoot(querySandboxRoot.trim());
    }
  }, [location.search, location.state]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!question.trim()) return;

      setState('running');
      setReport(null);
      setErrorMsg(null);

      const seedUrls: string[] | null = seedUrlsRaw.trim()
        ? seedUrlsRaw
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : null;

      const resolvedTargetUrl =
        mode === 'WEB_LIVE'
          ? resolveWebLiveTarget(question, targetUrl, seedUrls)
          : targetUrl.trim() || null;
      const resolvedSeedUrls =
        mode === 'WEB_LIVE' ? resolveWebLiveSeeds(question, seedUrls) : seedUrls;

      const useDeepAnalysis =
        userPreferencesEngine.getPreferences().customPreferences['deep_internet_analysis'] === true;

      const options: ResearchOptions = {
        mode,
        target_url: resolvedTargetUrl,
        sandbox_root: sandboxRoot.trim() || null,
        seed_urls: resolvedSeedUrls,
        max_depth: 1,
        max_sources: useDeepAnalysis ? 25 : 8,
        max_pages: useDeepAnalysis ? 30 : 10,
        max_requests: useDeepAnalysis ? 50 : 16,
        timeout_ms: useDeepAnalysis ? 120000 : 60000,
        cache_enabled: true,
        respect_robots: true,
      };

      try {
        const result = await webResearch({ question: question.trim() }, options);
        setReport(result);
        setState('done');
      } catch (err) {
        setErrorMsg(String(err));
        setState('error');
      }
    },
    [question, mode, targetUrl, seedUrlsRaw, sandboxRoot]
  );

  const resetForm = useCallback(() => {
    setState('idle');
    setReport(null);
    setErrorMsg(null);
  }, []);

  return (
    <ErrorBoundary>
      <div className="rp-root" data-testid="research-page">
        <header className="rp-header">
          <h1 className="rp-title">🔍 TITANE Research Engine</h1>
          <p className="rp-subtitle">
            Evidence-bound · Citations ≤25 words · Offline-capable · P7.0
          </p>
        </header>

        {/* ── QUERY FORM ── */}
        <form className="rp-form" onSubmit={handleSubmit} data-testid="research-form">
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-question">
              Question
            </label>
            <textarea
              id="rp-question"
              className="rp-textarea"
              data-testid="research-question"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Enter your research question…"
              rows={3}
              disabled={state === 'running'}
            />
          </div>

          <div className="rp-field rp-field-row">
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-mode">
                Mode
              </label>
              <select
                id="rp-mode"
                className="rp-select"
                data-testid="research-mode"
                value={mode}
                onChange={e => setMode(e.target.value as ResearchMode)}
                disabled={state === 'running'}
              >
                <option value="LOCAL_INDEX">LOCAL INDEX</option>
                <option value="WEB_LIVE">WEB LIVE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            {mode === 'WEB_LIVE' && (
              <div className="rp-field rp-field-grow">
                <label className="rp-label" htmlFor="rp-url">
                  Target URL
                </label>
                <input
                  id="rp-url"
                  className="rp-input"
                  data-testid="research-target-url"
                  type="url"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="exemple.tld/page"
                  disabled={state === 'running'}
                />
              </div>
            )}
          </div>

          {mode === 'WEB_LIVE' && (
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-seeds">
                Seed URLs (one per line, optional — P7 multi-URL discovery)
              </label>
              <textarea
                id="rp-seeds"
                className="rp-textarea rp-seeds"
                data-testid="research-seed-urls"
                value={seedUrlsRaw}
                onChange={e => setSeedUrlsRaw(e.target.value)}
                placeholder="exemple.tld/page&#10;autre.tld/page"
                rows={2}
                disabled={state === 'running'}
              />
            </div>
          )}

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-sandbox">
              Sandbox root
            </label>
            <input
              id="rp-sandbox"
              className="rp-input"
              data-testid="research-sandbox"
              type="text"
              value={sandboxRoot}
              onChange={e => setSandboxRoot(e.target.value)}
              disabled={state === 'running'}
            />
          </div>

          <div className="rp-actions">
            <button
              className="rp-btn rp-btn-primary"
              data-testid="research-submit"
              type="submit"
              disabled={state === 'running' || !question.trim()}
            >
              {state === 'running' ? '⏳ Researching…' : '🔍 Research'}
            </button>
            {state !== 'idle' && (
              <button
                className="rp-btn rp-btn-secondary"
                data-testid="research-reset"
                type="button"
                onClick={resetForm}
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* ── ERROR ── */}
        {state === 'error' && errorMsg && (
          <div className="rp-error-banner" data-testid="research-error" role="alert">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* ── RESULTS ── */}
        {state === 'done' && report && (
          <div className="rp-results" data-testid="research-results">
            {/* Mode badge */}
            <div className="rp-mode-badge" data-testid="research-mode-badge">
              {modeLabel(mode)}
            </div>

            {/* Verdict */}
            <div
              className={`rp-verdict ${verdictClass(report.trace.markers)}`}
              data-testid="research-verdict"
            >
              {report.trace.markers.find(m => m.startsWith('VERDICT_')) ?? 'UNKNOWN'}
            </div>

            {/* Answer */}
            <section className="rp-section" data-testid="research-answer-section">
              <h2 className="rp-section-title">Answer</h2>
              <div className="rp-answer-text" data-testid="research-answer">
                {report.answer.answer}
              </div>
              <div className="rp-answer-meta">
                Sources: {report.answer.sources_count} · Passages:{' '}
                {report.answer.retrieved_passages_count}
              </div>
            </section>

            {/* Citations / Sources */}
            {report.answer.citations.length > 0 && (
              <section className="rp-section" data-testid="research-sources-section">
                <h2 className="rp-section-title">
                  Sources ({report.answer.citations.length})
                </h2>
                <div className="rp-citations">
                  {report.answer.citations.map((c, i) => (
                    <CitationCard key={`${c.url}-${i}`} citation={c} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Limitations */}
            {report.answer.limitations && report.answer.limitations.length > 0 && (
              <section className="rp-section" data-testid="research-limitations-section">
                <h2 className="rp-section-title">Limitations</h2>
                <ul className="rp-limitations">
                  {report.answer.limitations.map((l, i) => (
                    <li key={i} className="rp-limitation">
                      {l}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Trace toggle */}
            <TracePanel report={report} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ResearchPage;
