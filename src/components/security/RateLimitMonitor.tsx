/**
 * TITANE∞ v19.3 — Rate Limit Monitor Component
 *
 * Composant React pour afficher les statistiques de rate limiting
 */

import { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  getRateLimitStats,
  resetRateLimit,
  shouldShowRateLimitWarning,
  getSecondsUntilReset,
  formatRateLimitError,
  type RateLimitStats,
} from '@/lib/securityHardening';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface RateLimitMonitorProps {
  userId?: string;
  refreshIntervalMs?: number;
  showResetButton?: boolean; // Admin only
}

export function RateLimitMonitor({
  userId,
  refreshIntervalMs = 5000,
  showResetButton = false,
}: RateLimitMonitorProps) {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const newStats = await getRateLimitStats(userId);
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleReset = async () => {
    if (!userId) {
      setError('User ID required for reset');
      return;
    }

    try {
      setResetting(true);
      await resetRateLimit(userId);
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [userId, refreshIntervalMs, fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Chargement des stats...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  const isWarning = shouldShowRateLimitWarning(stats);
  const isExceeded = stats.remaining === 0;
  const secondsUntilReset = getSecondsUntilReset(stats.reset_at);
  const percentUsed = (stats.count / stats.limit) * 100;

  return (
    <div className="space-y-3">
      {/* Alert si rate limit proche ou dépassé */}
      {isExceeded && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Rate Limit Dépassé</AlertTitle>
          <AlertDescription>{formatRateLimitError(stats)}</AlertDescription>
        </Alert>
      )}

      {isWarning && !isExceeded && (
        <Alert variant="warning" className="border-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>
            Plus que {stats.remaining} requêtes restantes avant le rate limit.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques détaillées */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Rate Limit Status</h3>
          {isExceeded ? (
            <Badge variant="destructive">Exceeded</Badge>
          ) : isWarning ? (
            <Badge variant="warning">Warning</Badge>
          ) : (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              OK
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {/* Barre de progression */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {stats.count} / {stats.limit} requêtes
              </span>
              <span>{stats.remaining} restantes</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          {/* Reset countdown */}
          {secondsUntilReset > 0 && (
            <div className="text-xs text-muted-foreground">
              Reset dans {Math.floor(secondsUntilReset / 60)}:
              {String(secondsUntilReset % 60).padStart(2, '0')}
            </div>
          )}

          {/* Admin reset button */}
          {showResetButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={resetting}
              className="w-full mt-2"
            >
              {resetting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Réinitialiser (Admin)
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Version compacte pour affichage dans la barre de statut
 */
export function RateLimitBadge({ userId }: { userId?: string }) {
  const [stats, setStats] = useState<RateLimitStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const newStats = await getRateLimitStats(userId);
        setStats(newStats);
      } catch (err) {
        console.error('Failed to fetch rate limit stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [userId]);

  if (!stats) return null;

  const isWarning = shouldShowRateLimitWarning(stats);
  const isExceeded = stats.remaining === 0;

  return (
    <Badge
      variant={isExceeded ? 'destructive' : isWarning ? 'warning' : 'secondary'}
      className="text-xs"
    >
      {isExceeded ? (
        <XCircle className="h-3 w-3 mr-1" />
      ) : isWarning ? (
        <AlertTriangle className="h-3 w-3 mr-1" />
      ) : (
        <CheckCircle className="h-3 w-3 mr-1" />
      )}
      {stats.remaining}/{stats.limit}
    </Badge>
  );
}
