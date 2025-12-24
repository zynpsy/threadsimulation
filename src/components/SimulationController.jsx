import React, { useState } from 'react';
import PersonaPool from './PersonaPool';
import ThreadView from './ThreadView';
import personasData from '../data/personas.json';
import threadData from '../data/agent_simulation.json';
import './SimulationController.css';

const SimulationController = () => {
  const [step, setStep] = useState('initial'); // initial, personas, thread
  const [threadRunning, setThreadRunning] = useState(false);

  const handleLoadPersonas = () => {
    setStep('personas');
  };

  const handleStartThread = () => {
    setStep('thread');
    setThreadRunning(true);
  };

  const handleDirectStart = () => {
    setStep('thread');
    setThreadRunning(true);
  };

  const handleThreadComplete = () => {
    setThreadRunning(false);
  };

  const handleReset = () => {
    setStep('initial');
    setThreadRunning(false);
  };

  return (
    <div className="simulation-controller">
      {step === 'initial' && (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>Bluesky Thread Simülasyonu</h1>
            <p className="welcome-subtitle">
              AI tarafından oluşturulan personalar ve gerçek thread karşılaştırması
            </p>
            <div className="welcome-info">
              <div className="info-card">
                <div className="info-icon">👥</div>
                <h3>{personasData.length} Persona</h3>
                <p>AI-generated karakter analizleri</p>
              </div>
              <div className="info-card">
                <div className="info-icon">💬</div>
                <h3>{threadData[0]?.thread_info?.total_messages || 0} Mesaj</h3>
                <p>Gerçek vs AI karşılaştırması</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🤖</div>
                <h3>Real-time</h3>
                <p>5 saniye aralıklarla akış</p>
              </div>
            </div>
            <div className="button-group">
              <button className="primary-button" onClick={handleLoadPersonas}>
                Personaları Görüntüle
              </button>
              <button className="secondary-button-alt" onClick={handleDirectStart}>
                Doğrudan Simülasyonu Başlat →
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'personas' && (
        <div className="personas-screen">
          <PersonaPool personas={personasData} />
          <button className="fixed-start-button" onClick={handleStartThread}>
            Simülasyonu Başlat →
          </button>
        </div>
      )}

      {step === 'thread' && (
        <div className="thread-screen">
          <ThreadView
            threadData={threadData[0]}
            isRunning={threadRunning}
            onComplete={handleThreadComplete}
          />
          <div className="action-buttons">
            <button className="secondary-button" onClick={handleReset}>
              Yeniden Başlat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationController;
