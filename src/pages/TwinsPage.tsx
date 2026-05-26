/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Twins Page
 * Page des jumeaux numériques : gestion et visualisation des digital
 * twins, état de synchronisation, comportements, identités.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { TwinEvolutionPanel } from '../components/twin/TwinEvolutionPanel';
import { useTwinIdentity } from '../hooks/useTwinIdentity';
import { useTwinEvolution } from '../hooks/useTwinEvolution';
import {
  Users,
  RefreshCw,
  Link2,
  Star,
  Activity,
  Heart,
  User,
  Cpu,
  GitMerge,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { SurfaceTruthBadge } from '@/components/system/SurfaceTruthBadge';
import { safeInvokeCanonical } from '@/utils/invoke';
import { moduleContextRegistry } from '@/services/modules/moduleContextRegistry';
import {
  approveTwinChatReviewItem,
  listTwinChatReviewItems,
  rejectTwinChatReviewItem,
  type TwinChatReviewItem,
} from '@/services/twin_chat';

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TwinsPage: React.FC = () => {
  const {
    identity,
    isLoading: identityLoading,
    coreValues,
    humanStyle,
    fusionIndex,
    refresh: refreshIdentity,
  } = useTwinIdentity();

  const {
    evolutionProfile,
    fusionIndex: evolutionFusion,
    syncScore,
    currentPhase,
    chatContextStatus,
    growthTrends,
    ownerThemes,
    sourceCount,
    isLoading: evolutionLoading,
    refresh: refreshEvolution,
  } = useTwinEvolution();

  const isLoading = identityLoading || evolutionLoading;
  const [liveConnected, setLiveConnected] = useState(false);
  const [reviewItems, setReviewItems] = useState<TwinChatReviewItem[]>([]);
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const pendingReviewItems = reviewItems.filter(item => item.writeStatus === 'pending');

  const refreshReviewItems = () => {
    setReviewItems(listTwinChatReviewItems());
  };

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const r = await safeInvokeCanonical<{ harmonia?: unknown }>(
        'engine_get_singularity_state'
      );
      if (!cancelled) setLiveConnected(r.ok && r.content?.harmonia != null);
    };
    void probe();
    const id = setInterval(() => void probe(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refreshIdentity(), refreshEvolution()]);
  };

  useEffect(() => {
    void handleRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshReviewItems();

    const handleQueueChange = () => {
      refreshReviewItems();
    };

    window.addEventListener('titane:twin-chat-review-queue-changed', handleQueueChange);
    return () => {
      window.removeEventListener(
        'titane:twin-chat-review-queue-changed',
        handleQueueChange
      );
    };
  }, []);

  // Module context registry — publish TWIN snapshot
  useEffect(() => {
    moduleContextRegistry.publish('twin.main', {
      moduleId: 'twin.main',
      route: '/twins',
      title: 'Twins — Jumeaux Numériques',
      status: isLoading ? 'partial' : liveConnected ? 'live' : 'partial',
      source: 'tauri_ipc',
      capabilities: [
        'twin-identity',
        'fusion-index',
        'evolution-profile',
        'sync-status',
        'chat-context-status',
      ],
      visibleMetrics: {
        fusionIndex: fusionIndex ?? evolutionFusion ?? null,
        syncScore: syncScore ?? null,
        sourceCount: sourceCount ?? null,
        currentPhase: currentPhase ?? null,
        chatContextStatus: chatContextStatus ?? null,
        liveConnected,
        pendingReviewItems: pendingReviewItems.length,
      },
      actions: [
        { id: 'refresh', label: 'Rafraîchir', status: 'wired' },
        {
          id: 'inspect_sources',
          label: 'Inspecter les sources',
          status: sourceCount != null ? 'wired' : 'blocked',
        },
        {
          id: 'sync_now',
          label: 'Synchroniser maintenant',
          status: liveConnected ? 'wired' : 'blocked',
          reason: liveConnected ? undefined : 'Singularity engine not connected',
        },
      ],
      warnings: isLoading ? ['Twin data loading'] : reviewError ? [reviewError] : [],
    });
  }, [
    isLoading,
    liveConnected,
    fusionIndex,
    evolutionFusion,
    syncScore,
    sourceCount,
    currentPhase,
    chatContextStatus,
    pendingReviewItems.length,
    reviewError,
  ]);

  const handleApproveReview = async (reviewId: string) => {
    setReviewBusyId(reviewId);
    setReviewError(null);

    try {
      await approveTwinChatReviewItem(reviewId);
      refreshReviewItems();
      await handleRefresh();
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : 'Validation Twin limitee indisponible'
      );
      refreshReviewItems();
    } finally {
      setReviewBusyId(null);
    }
  };

  const handleRejectReview = (reviewId: string) => {
    setReviewError(null);
    rejectTwinChatReviewItem(reviewId);
    refreshReviewItems();
  };

  return (
    <div
      className="twins-root flex min-h-full w-full flex-col bg-titanium-bg-base p-6 text-titanium-text-primary"
      data-testid="page-twins"
    >
      <div
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-6"
        data-testid="page-twins-content"
      >
        {/* Runtime Truth Badge — ACTIVE — v97 */}
        <SurfaceTruthBadge variant={liveConnected ? 'LIVE' : 'PARTIAL'} />
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-violet-400" />
            <div>
              <h1 className="text-2xl font-bold text-titanium-text-primary">
                Twins — Digital Twins
              </h1>
              <p className="text-sm text-titanium-text-tertiary">
                Gestion et visualisation des jumeaux numériques — Symbiose Kevin ↔ TITANE∞
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                chatContextStatus === 'active'
                  ? 'success'
                  : chatContextStatus === 'stale'
                    ? 'warning'
                    : 'neutral'
              }
              size="sm"
              dot
            >
              Chat {chatContextStatus}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Sync KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-titanium-text-tertiary">Score de sync</span>
            </div>
            <p className="text-3xl font-bold text-violet-400">
              {syncScore > 0 ? `${(syncScore * 100).toFixed(0)}%` : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-titanium-text-tertiary">Index de fusion</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {evolutionFusion != null
                ? `${(
                    (typeof evolutionFusion === 'number'
                      ? evolutionFusion
                      : (evolutionFusion.globalScore ?? 0)) * 100
                  ).toFixed(0)}%`
                : fusionIndex > 0
                  ? `${(fusionIndex * 100).toFixed(0)}%`
                  : '—'}
            </p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-titanium-text-tertiary">Sources connues</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{sourceCount}</p>
          </Card>

          <Card variant="glass" elevation="md" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-titanium-text-tertiary">Phase actuelle</span>
            </div>
            <p className="text-lg font-bold text-green-400 truncate">
              {currentPhase ? String(currentPhase) : '—'}
            </p>
          </Card>
        </div>

        <Card variant="solid" padding={4} data-testid="twin-chat-review-queue">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-titanium-text-secondary">
                Review chat → Twin
              </h2>
              <p
                className="mt-1 text-sm text-titanium-text-tertiary"
                data-testid="twin-chat-review-summary"
              >
                {pendingReviewItems.length > 0
                  ? `${pendingReviewItems.length} observation${pendingReviewItems.length > 1 ? 's' : ''} en attente de validation explicite Kevin avant ecriture limitee.`
                  : 'Aucune observation twin_chat en attente de validation explicite.'}
              </p>
            </div>
            <Badge
              variant={pendingReviewItems.length > 0 ? 'warning' : 'success'}
              size="sm"
              data-testid="twin-chat-review-count"
            >
              pending:{pendingReviewItems.length}
            </Badge>
          </div>

          {reviewError ? (
            <div
              className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              data-testid="twin-chat-review-error"
            >
              {reviewError}
            </div>
          ) : null}

          {pendingReviewItems.length === 0 ? (
            <div
              className="rounded-lg border border-titanium-border-default bg-titanium-bg-elevated/60 px-4 py-3 text-sm text-titanium-text-tertiary"
              data-testid="twin-chat-review-empty"
            >
              Les observations shadow derivees du chat apparaissent ici uniquement si la
              policy D3 demande une validation humaine avant write TWIN.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviewItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-titanium-border-default bg-titanium-bg-elevated/80 p-4"
                  data-testid={`twin-chat-review-item-${index}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info" size="sm">
                      {item.candidate.kind}
                    </Badge>
                    <Badge
                      variant={
                        item.decision.verdict === 'review_required'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {item.decision.verdict}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      confidence:{Math.round(item.candidate.confidence * 100)}%
                    </Badge>
                  </div>
                  <p
                    className="mt-3 text-base font-medium text-titanium-text-primary"
                    data-testid={`twin-chat-review-item-content-${index}`}
                  >
                    {item.candidate.contentCompact}
                  </p>
                  <p className="mt-1 text-sm text-titanium-text-tertiary">
                    contexte:{item.candidate.context} · source:
                    {item.candidate.evidenceSource}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void handleApproveReview(item.id)}
                      disabled={reviewBusyId === item.id}
                      data-testid={`twin-chat-review-approve-${index}`}
                    >
                      {reviewBusyId === item.id ? 'Validation...' : 'Valider et ecrire'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRejectReview(item.id)}
                      disabled={reviewBusyId === item.id}
                      data-testid={`twin-chat-review-reject-${index}`}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Twin Identity + Profile ── */}
        {isLoading ? (
          <Card variant="solid" padding={6}>
            <div className="flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span className="text-titanium-text-tertiary">
                Chargement identité Twin...
              </span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity */}
            <Card variant="solid" padding={4}>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-titanium-text-secondary">
                  Identité du Twin
                </h2>
              </div>
              {identity ? (
                <div className="space-y-3">
                  {identity.name && (
                    <div>
                      <p className="text-xs text-titanium-text-disabled">Nom</p>
                      <p className="text-titanium-text-primary font-medium">
                        {identity.name}
                      </p>
                    </div>
                  )}
                  {identity.signature && (
                    <div>
                      <p className="text-xs text-titanium-text-disabled">Signature</p>
                      <p className="text-titanium-text-secondary italic text-sm">
                        {identity.signature}
                      </p>
                    </div>
                  )}
                  {humanStyle && (
                    <div>
                      <p className="text-xs text-titanium-text-disabled">Style humain</p>
                      <p className="text-titanium-text-secondary text-sm">
                        Précision {Math.round(humanStyle.calmPrecision * 100)}% · Fluidité{' '}
                        {Math.round(humanStyle.organicFluidity * 100)}% · Sincérité{' '}
                        {Math.round(humanStyle.sincerity * 100)}%
                      </p>
                    </div>
                  )}
                  {coreValues.length > 0 && (
                    <div>
                      <p className="text-xs text-titanium-text-disabled mb-1">
                        Valeurs fondamentales
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {coreValues.slice(0, 5).map((v, i) => (
                          <Badge key={i} variant="primary" size="sm">
                            {v.name ?? String(v)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-titanium-text-disabled text-sm">
                  Identité non disponible
                </p>
              )}
            </Card>

            {/* Evolution profile */}
            <Card variant="solid" padding={4}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-titanium-text-secondary">
                  Profil d'évolution
                </h2>
              </div>
              {evolutionProfile ? (
                <div className="space-y-3">
                  {growthTrends && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(growthTrends)
                        .slice(0, 4)
                        .map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs text-titanium-text-disabled">{key}</p>
                            <p className="text-sm text-titanium-text-primary font-mono">
                              {typeof val === 'number' ? val.toFixed(2) : String(val)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  {ownerThemes.length > 0 && (
                    <div>
                      <p className="text-xs text-titanium-text-secondary mb-1">
                        Thèmes propriétaire
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ownerThemes.slice(0, 4).map((theme, i) => (
                          <Badge key={i} variant="info" size="sm">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-titanium-text-disabled text-sm">
                  Profil non disponible
                </p>
              )}
            </Card>
          </div>
        )}

        {/* ── Sync status ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-titanium-text-secondary">
                Comportements
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Empathie', active: true },
                { label: 'Curiosité', active: true },
                { label: 'Authenticité', active: true },
                { label: 'Adaptation', active: syncScore > 0.8 },
              ].map(b => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-titanium-text-secondary">{b.label}</span>
                  <Badge variant={b.active ? 'success' : 'neutral'} size="sm" dot>
                    {b.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-titanium-text-secondary">
                Synchronisation
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-titanium-text-tertiary mb-1">
                  <span>Mémoire partagée</span>
                  <span>87%</span>
                </div>
                <div className="w-full bg-titanium-bg-interactive rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: '87%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-titanium-text-tertiary mb-1">
                  <span>Cohérence valeurs</span>
                  <span>{syncScore > 0 ? `${(syncScore * 100).toFixed(0)}%` : '—'}</span>
                </div>
                <div className="w-full bg-titanium-bg-interactive rounded-full h-1.5">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full"
                    style={{ width: `${syncScore > 0 ? syncScore * 100 : 80}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="solid" padding={4}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-titanium-text-secondary">
                État chat
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-titanium-text-tertiary">Contexte chat</span>
                <Badge
                  variant={
                    chatContextStatus === 'active'
                      ? 'success'
                      : chatContextStatus === 'stale'
                        ? 'warning'
                        : 'neutral'
                  }
                  size="sm"
                >
                  {chatContextStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-titanium-text-tertiary">Twin actif</span>
                <Badge variant="success" size="sm" dot>
                  Oui
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-titanium-text-tertiary">Sources</span>
                <span className="text-titanium-text-primary">{sourceCount}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Twin Evolution Panel ── */}
        <Card variant="solid" padding={0}>
          <div className="p-4 border-b border-titanium-border-default flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-semibold text-titanium-text-secondary">
              Panneau d'évolution du Twin
            </h2>
          </div>
          <div className="p-4">
            <TwinEvolutionPanel isAdmin={true} compact={false} />
          </div>
        </Card>
      </div>
    </div>
  );
};
TwinsPage.displayName = 'TwinsPage';

export default TwinsPage;
