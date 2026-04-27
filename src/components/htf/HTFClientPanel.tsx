// HTF Module — L'Humain à tout faire
// Panneau CRM clients

import React, { useState } from 'react';
import { useHTFStore } from '../../stores/useHTFStore';
import { createClient, deleteClient } from '../../services/htf/htfCrmService';
import type { HTFClient } from '../../services/htf/types';

export function HTFClientPanel() {
  const { clients, activeClient, setActiveClient, addClient, loadAll } = useHTFStore();
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState('');
  const [courriel, setCourriel] = useState('');
  const [telephone, setTelephone] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const client = createClient({ nom, courriel, telephone });
    addClient(client);
    setNom('');
    setCourriel('');
    setTelephone('');
    setShowForm(false);
  }

  function handleDelete(id: string) {
    deleteClient(id);
    loadAll();
    if (activeClient?.id === id) setActiveClient(null);
  }

  return (
    <div data-testid="htf-client-panel" className="htf-client-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-700">👥 CRM Clients</h3>
        <button
          data-testid="htf-btn-nouveau-client"
          onClick={() => setShowForm(v => !v)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
        >
          + Nouveau client
        </button>
      </div>

      {showForm && (
        <form
          data-testid="htf-client-form"
          onSubmit={handleCreate}
          className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2"
        >
          <input
            data-testid="htf-input-nom"
            required
            placeholder="Nom complet *"
            value={nom}
            onChange={e => setNom(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm"
          />
          <input
            data-testid="htf-input-courriel"
            type="email"
            placeholder="Courriel"
            value={courriel}
            onChange={e => setCourriel(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm"
          />
          <input
            data-testid="htf-input-telephone"
            placeholder="Téléphone"
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm"
          />
          <button
            type="submit"
            data-testid="htf-btn-save-client"
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Enregistrer
          </button>
        </form>
      )}

      <ul data-testid="htf-client-list" className="space-y-2">
        {clients.length === 0 && (
          <li className="text-sm text-gray-400 italic">Aucun client enregistré</li>
        )}
        {clients.map((c: HTFClient) => (
          <li
            key={c.id}
            data-testid={`htf-client-item-${c.id}`}
            onClick={() => setActiveClient(c)}
            className={`rounded-lg border p-3 cursor-pointer text-sm flex items-center justify-between ${
              activeClient?.id === c.id
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div>
              <p className="font-semibold text-gray-800">{c.nom}</p>
              {c.courriel && <p className="text-gray-500 text-xs">{c.courriel}</p>}
              <p className="text-xs text-gray-400">{c.nbSoumissions} soumission(s)</p>
            </div>
            <button
              data-testid={`htf-btn-delete-client-${c.id}`}
              onClick={e => {
                e.stopPropagation();
                handleDelete(c.id);
              }}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
