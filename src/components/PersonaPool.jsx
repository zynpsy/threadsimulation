import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3-force';
import PersonaModal from './PersonaModal';
import { getAvatarEmoji } from '../utils/avatarUtils';
import './PersonaPool.css';

const PersonaPool = ({ personas }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [containerSize, setContainerSize] = useState({ width: 2000, height: 2000 });
  const simulationRef = useRef(null);
  const containerRef = useRef(null);
  const poolWrapperRef = useRef(null);

  // Remove duplicates based on user_handle
  const uniquePersonas = useMemo(() => {
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

  // Initialize force simulation with larger canvas
  useEffect(() => {
    if (!uniquePersonas.length || !poolWrapperRef.current) return;

    const wrapper = poolWrapperRef.current;
    const viewportWidth = wrapper.clientWidth;
    const viewportHeight = wrapper.clientHeight;

    // Calculate needed space based on number of personas
    const personaCount = uniquePersonas.length;
    const minArea = personaCount * 15000; // ~15000px² per persona
    const aspectRatio = 16 / 9;
    const width = Math.max(2000, Math.sqrt(minArea * aspectRatio));
    const height = Math.max(2000, width / aspectRatio);

    setContainerSize({ width, height });

    const radius = 35; // Avatar radius

    // Initialize nodes with random positions across the larger canvas
    const initialNodes = uniquePersonas.map((persona, i) => ({
      id: persona.user_handle,
      persona: persona,
      x: Math.random() * (width - 200) + 100,
      y: Math.random() * (height - 200) + 100,
      vx: 0,
      vy: 0,
    }));

    setNodes(initialNodes);

    // Create force simulation
    const simulation = d3.forceSimulation(initialNodes)
      .force('charge', d3.forceManyBody().strength(-500)) // Stronger repulsion
      .force('collision', d3.forceCollide().radius(radius + 25)) // More spacing
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.03)) // Weaker center
      .force('x', d3.forceX(width / 2).strength(0.01)) // Weaker bounds
      .force('y', d3.forceY(height / 2).strength(0.01)) // Weaker bounds
      .alphaDecay(0.015) // Even slower cooling
      .velocityDecay(0.4) // More friction
      .on('tick', () => {
        setNodes([...simulation.nodes()]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [uniquePersonas]);

  const handleAvatarClick = (persona) => {
    setSelectedPersona(persona);
  };

  const handleCloseModal = () => {
    setSelectedPersona(null);
  };

  return (
    <div className="persona-pool-container">
      <div className="pool-header">
        <h2>Simülasyon Karakterleri</h2>
        <p className="pool-subtitle">
          {uniquePersonas.length} persona · Bir avatara tıklayarak detayları görün
        </p>
      </div>

      <div className="pool-scroll-wrapper" ref={poolWrapperRef}>
        <div
          className="floating-pool"
          ref={containerRef}
          style={{
            width: `${containerSize.width}px`,
            height: `${containerSize.height}px`,
          }}
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              className="floating-avatar force-directed"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
              }}
              onClick={() => handleAvatarClick(node.persona)}
              title={`@${node.persona.user_handle}`}
            >
              <div className="avatar-circle emoji-avatar">
                {getAvatarEmoji(node.persona.user_handle)}
              </div>
              <div className="avatar-label">
                @{node.persona.user_handle.split('.')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPersona && (
        <PersonaModal persona={selectedPersona} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default PersonaPool;
