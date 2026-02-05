/**
 * TITANE∞ vΩ.2 — Request In-Flight Store
 * Partage l'état request_in_flight pour throttler les cycles UI.
 */

import { create } from 'zustand';

interface RequestInFlightState {
  requestInFlight: boolean;
  setRequestInFlight: (value: boolean) => void;
}

export const useRequestInFlightStore = create<RequestInFlightState>(set => ({
  requestInFlight: false,
  setRequestInFlight: value => set({ requestInFlight: value }),
}));
