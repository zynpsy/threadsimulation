import React, { useState, useEffect } from 'react';
import PersonaCard from './PersonaCard';
import './PersonaGrid.css';

const PersonaGrid = ({ personas, onComplete }) => {
  const [visiblePersonas, setVisiblePersonas] = useState([]);

  // Remove duplicates based on user_handle
  const uniquePersonas = React.useMemo(() => {
    if (!personas) return [];
    const seen = new Set();
    return personas.filter(persona => {
      const handle = persona.user_handle;
      if (seen.has(handle)) {
        return false;
      }
      seen.add(handle);
      return true;
    });
  }, [personas]);

  useEffect(() => {
    if (uniquePersonas && uniquePersonas.length > 0) {
      uniquePersonas.forEach((persona, index) => {
        setTimeout(() => {
          setVisiblePersonas(prev => [...prev, persona]);
          if (index === uniquePersonas.length - 1) {
            setTimeout(() => onComplete && onComplete(), 500);
          }
        }, index * 300);
      });
    }
  }, [uniquePersonas, onComplete]);

  return (
    <div className="persona-grid-container">
      <h2 className="grid-title">Simülasyon Karakterleri</h2>
      <p className="grid-subtitle">AI tarafından oluşturulan persona analizleri</p>
      <div className="persona-grid">
        {visiblePersonas.map((persona, index) => (
          <PersonaCard
            key={persona.user_handle}
            persona={persona}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonaGrid;
