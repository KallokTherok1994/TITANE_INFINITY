// HTF Module — L'Humain à tout faire
// CRM clients — CRUD localStorage

import type { HTFClient } from './types';

const STORAGE_KEY = 'titane_htf_clients';

function loadClients(): HTFClient[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HTFClient[];
  } catch {
    return [];
  }
}

function saveClients(clients: HTFClient[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function getAllClients(): HTFClient[] {
  return loadClients();
}

export function getClient(id: string): HTFClient | undefined {
  return loadClients().find(c => c.id === id);
}

export function createClient(
  data: Omit<HTFClient, 'id' | 'dateCreation' | 'nbSoumissions'>
): HTFClient {
  const clients = loadClients();
  const newClient: HTFClient = {
    nom: data.nom,
    courriel: data.courriel,
    telephone: data.telephone,
    adresse: data.adresse,
    noteInterne: data.noteInterne,
    id: `htf-client-${Date.now()}`,
    dateCreation: new Date().toISOString(),
    nbSoumissions: 0,
  };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

export function updateClient(
  id: string,
  data: Partial<HTFClient>
): HTFClient | undefined {
  const clients = loadClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  clients[idx] = { ...(clients[idx] as HTFClient), ...data } as HTFClient;
  saveClients(clients);
  return clients[idx];
}

export function deleteClient(id: string): boolean {
  const clients = loadClients();
  const filtered = clients.filter(c => c.id !== id);
  if (filtered.length === clients.length) return false;
  saveClients(filtered);
  return true;
}

export function incrementClientSubmissions(id: string): void {
  const clients = loadClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx !== -1) {
    const client = clients[idx];
    if (client) {
      client.nbSoumissions = (client.nbSoumissions ?? 0) + 1;
      saveClients(clients);
    }
  }
}
