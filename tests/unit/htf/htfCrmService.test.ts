// Tests unitaires — HTF CRM Service
// L'Humain à tout faire — Kevin Thibault

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllClients,
  createClient,
  getClient,
  updateClient,
  deleteClient,
  incrementClientSubmissions,
} from '../../../src/services/htf/htfCrmService';

const STORAGE_KEY = 'titane_htf_clients';

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe('HTFCrmService', () => {
  it('retourne une liste vide au départ', () => {
    expect(getAllClients()).toEqual([]);
  });

  it('crée un client avec id et dateCreation', () => {
    const client = createClient({ nom: 'Marie Tremblay' });
    expect(client.id).toBeTruthy();
    expect(client.nom).toBe('Marie Tremblay');
    expect(client.nbSoumissions).toBe(0);
    expect(client.dateCreation).toBeTruthy();
  });

  it('récupère un client par id', () => {
    const created = createClient({ nom: 'Jean Simard', courriel: 'jean@test.com' });
    const found = getClient(created.id);
    expect(found?.nom).toBe('Jean Simard');
    expect(found?.courriel).toBe('jean@test.com');
  });

  it('retourne undefined pour un id inexistant', () => {
    expect(getClient('id-inexistant')).toBeUndefined();
  });

  it('met à jour un client existant', () => {
    const client = createClient({ nom: 'Pierre Gagnon' });
    const updated = updateClient(client.id, { nom: 'Pierre Gagnon Jr.' });
    expect(updated?.nom).toBe('Pierre Gagnon Jr.');
  });

  it('supprime un client', () => {
    const client = createClient({ nom: 'À supprimer' });
    expect(deleteClient(client.id)).toBe(true);
    expect(getClient(client.id)).toBeUndefined();
  });

  it('retourne false si suppression sur id inexistant', () => {
    expect(deleteClient('id-bidon')).toBe(false);
  });

  it('incrémente le compteur de soumissions', () => {
    const client = createClient({ nom: 'Test compteur' });
    incrementClientSubmissions(client.id);
    incrementClientSubmissions(client.id);
    const found = getClient(client.id);
    expect(found?.nbSoumissions).toBe(2);
  });

  it('persiste plusieurs clients', () => {
    createClient({ nom: 'Client A' });
    createClient({ nom: 'Client B' });
    createClient({ nom: 'Client C' });
    expect(getAllClients()).toHaveLength(3);
  });
});
