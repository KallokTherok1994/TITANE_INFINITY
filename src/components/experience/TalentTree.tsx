
// 🌳 TalentTree — Arbre de talents

import React from 'react';



interface TalentTreeState {

  branches: Record<string, any>;

  total_unlocked: number;

  total_talents: number;

  global_effects: any[];

}



interface TalentTreeProps {

  talents: TalentTreeState;

}



export const TalentTree: React.FC<TalentTreeProps> = ({ talents }) => {

  return (

    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '1rem' }}>

        🌳 Arbre de Talents

      </h2>

      <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>

        {talents.total_unlocked} / {talents.total_talents} talents débloqués

      </div>

      <div style={{ marginTop: '2rem', color: '#6b7280' }}>

        Visualisation de l'arbre de talents à venir...

      </div>

    </div>

  );

};

