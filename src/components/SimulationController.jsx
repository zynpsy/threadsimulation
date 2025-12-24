import React, { useState } from 'react';
import PersonaPool from './PersonaPool';
import ThreadView from './ThreadView';
import personasData from '../data/personas.json';
import threadData from '../data/agent_simulation.json';
import './SimulationController.css';

const SimulationController = () => {
  const [step, setStep] = useState('initial'); // initial, personas, thread
  const [threadRunning, setThreadRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleLoadPersonas = () => {
    setStep('personas');
  };

  const handleStartThread = () => {
    setStep('thread');
    setThreadRunning(true);
    setIsPaused(false);
  };

  const handleDirectStart = () => {
    setStep('thread');
    setThreadRunning(true);
    setIsPaused(false);
  };

  const handleThreadComplete = () => {
    setThreadRunning(false);
  };

  const handleReset = () => {
    setStep('initial');
    setThreadRunning(false);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  const handleBackToPersonas = () => {
    setStep('personas');
    setThreadRunning(false);
    setIsPaused(false);
  };

  const handleBackToHome = () => {
    setStep('initial');
    setThreadRunning(false);
    setIsPaused(false);
  };

  return (
    <div className="simulation-controller">
      {step === 'initial' && (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>Bluesky Thread Simulation</h1>
            <p className="welcome-subtitle">
              AI-generated personas vs real thread comparison
            </p>
            <div className="welcome-info">
              <div className="info-card">
                <div className="info-icon">👥</div>
                <h3>{personasData.length} Personas</h3>
                <p>AI-generated character analyses</p>
              </div>
              <div className="info-card">
                <div className="info-icon">💬</div>
                <h3>{threadData[0]?.thread_info?.total_messages || 0} Messages</h3>
                <p>Real vs AI comparison</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🤖</div>
                <h3>Real-time</h3>
                <p>5-second interval streaming</p>
              </div>
            </div>
            <div className="button-group">
              <button className="primary-button" onClick={handleLoadPersonas}>
                View Personas
              </button>
              <button className="secondary-button-alt" onClick={handleDirectStart}>
                Start Simulation Directly →
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'personas' && (
        <div className="personas-screen">
          <PersonaPool personas={personasData} />
          <div className="personas-control-panel">
            <button className="control-button home-button" onClick={handleBackToHome}>
              ← Home
            </button>
            <button className="control-button start-button" onClick={handleStartThread}>
              Start Simulation →
            </button>
          </div>
        </div>
      )}

      {step === 'thread' && (
        <div className="thread-screen">
          <ThreadView
            threadData={threadData[0]}
            isRunning={threadRunning}
            isPaused={isPaused}
            onComplete={handleThreadComplete}
          />
          <div className="control-panel">
            <button className="control-button home-button" onClick={handleBackToHome}>
              ← Home
            </button>
            <button className="control-button personas-button" onClick={handleBackToPersonas}>
              View Personas
            </button>
            <button className="control-button pause-button" onClick={handlePauseResume}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationController;
