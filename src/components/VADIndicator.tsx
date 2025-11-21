
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

