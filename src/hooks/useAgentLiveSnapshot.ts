/**
 * useAgentLiveSnapshot — hook generique pour rafraichir un snapshot agent
 * a intervalle borne et exposer lastUpdate + refresh manuel.
 *
 * Scope: factorisation des dashboards agents avances (Rule 17 - canonical
 * surface). Utilise par ExplainabilityDashboard (Phase L/M v34.0.8) et
 * potentiellement d autres dashboards futurs. Les dashboards existants
 * (monitoring/diagnostic/log_analysis/orchestrator/security) conservent
 * leur logique specifique pour minimiser le risque de regression.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AgentLiveSnapshot<T> {
  data: T;
  lastUpdate: number;
  refresh: () => void;
}

export function useAgentLiveSnapshot<T>(
  snapshotFn: () => T,
  intervalMs: number
): AgentLiveSnapshot<T> {
  const [data, setData] = useState<T>(() => snapshotFn());
  const [lastUpdate, setLastUpdate] = useState<number>(() => Date.now());
  // Conserver la derniere ref de snapshotFn pour eviter de reinstaller
  // l'intervalle a chaque rendu si la fonction est inline.
  const fnRef = useRef(snapshotFn);
  fnRef.current = snapshotFn;

  const refresh = useCallback(() => {
    setData(fnRef.current());
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const id = window.setInterval(
      () => {
        setData(fnRef.current());
        setLastUpdate(Date.now());
      },
      Math.max(1000, intervalMs)
    );
    return () => {
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return { data, lastUpdate, refresh };
}
