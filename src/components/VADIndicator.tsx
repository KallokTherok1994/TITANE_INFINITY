/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */


// VADIndicator Component

import React from 'react';



interface VADIndicatorProps {

  active: boolean;

}



export const VADIndicator: React.FC<VADIndicatorProps> = ({ active }) => {

  return (

    <div className={`vad-indicator ${active ? 'active' : ''}`}>

      <div className="vad-bar"></div>

      <span>{active ? 'Voice Detected' : 'Listening...'}</span>

    </div>

  );

};

