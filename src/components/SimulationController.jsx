import React, { useState, useEffect } from 'react';
import PersonaPool from './PersonaPool';
import ThreadView from './ThreadView';
import UserReplyForm from './UserReplyForm';
import PersonaPreview from './PersonaPreview';
import useSimulationWebSocket from '../hooks/useSimulationWebSocket';
import { startSimulation, createUserPersona } from '../services/api';
import personasData from '../data/personas.json';
import threadData from '../data/thread.json';
import './SimulationController.css';

const SimulationController = () => {
  const [step, setStep] = useState('initial'); // initial, personas, user-reply, user-persona-preview, thread
  const [personas, setPersonas] = useState([...personasData]);
  const [currentThreadData, setCurrentThreadData] = useState(threadData);
  const [threadRunning, setThreadRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdUserPersona, setCreatedUserPersona] = useState(null);
  const [pendingSimulationData, setPendingSimulationData] = useState(null);

  // WebSocket hook
  const {
    isConnected,
    messages: wsMessages,
    error: wsError,
    isComplete: wsComplete,
    progress: wsProgress,
    isPaused: wsPaused,
    clientId,
    connect: wsConnect,
    disconnect: wsDisconnect,
    reset: wsReset,
    clearMessages: wsClearMessages,
    pause: wsPause,
    resume: wsResume
  } = useSimulationWebSocket();

  // Step-based WebSocket connection management
  useEffect(() => {
    // Connect on user-reply, user-persona-preview, and thread pages
    if (step === 'user-reply' || step === 'user-persona-preview' || step === 'thread') {
      if (!isConnected) {
        console.log(`[Step: ${step}] Connecting WebSocket...`);
        wsConnect();
      }
    } else {
      // Disconnect on initial and personas pages
      if (isConnected) {
        console.log(`[Step: ${step}] Disconnecting WebSocket...`);
        wsDisconnect();
      }
    }
  }, [step, isConnected, wsConnect, wsDisconnect]);

  const handleLoadPersonas = () => {
    setStep('personas');
  };

  const handleContinueToUserReply = () => {
    setStep('user-reply');
  };

  const handleSkipUserReply = async () => {
    // Go to thread screen and start simulation automatically
    await handleStartThread();
  };

  const handleUserReplySubmit = async ({ userName, userReply }) => {
    setIsLoading(true);
    setApiError(null);

    if (!clientId) {
      setApiError('WebSocket not connected. Please wait...');
      setIsLoading(false);
      return;
    }

    try {
      // Extract original post data
      const originalPost = {
        uri: currentThreadData[0].uri,
        author: currentThreadData[0].author.handle,
        text: currentThreadData[0].text,
        created_at: currentThreadData[0].created_at
      };

      // Extract existing replies from current thread data
      const existingReplies = currentThreadData[0].replies || [];

      // Create user persona
      const response = await createUserPersona(
        clientId,
        userName,
        userReply,
        originalPost,
        personas,
        existingReplies
      );

      console.log('User persona created:', response);

      // Calculate updated data BEFORE setting state
      const updatedPersonas = [...personas, response.persona];
      const updatedThreadData = [...currentThreadData];
      updatedThreadData[0] = {
        ...updatedThreadData[0],
        replies: [...updatedThreadData[0].replies, response.reply]
      };

      // Update state
      setPersonas(updatedPersonas);
      setCurrentThreadData(updatedThreadData);
      setCreatedUserPersona(response.persona);

      // Store the data for simulation (to use when user clicks "Start Simulation")
      setPendingSimulationData({
        threadData: updatedThreadData,
        personas: updatedPersonas
      });

      // Go to persona preview screen (don't start simulation yet)
      setStep('user-persona-preview');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to create user persona:', error);
      setApiError(error.message);
      setIsLoading(false);
      throw error; // Let UserReplyForm handle error display
    }
  };

  const handleStartSimulationFromPreview = async () => {
    // Start simulation with the pending data (from user persona creation)
    if (pendingSimulationData) {
      await handleStartThread(
        pendingSimulationData.threadData,
        pendingSimulationData.personas
      );
    } else {
      // Fallback: start with current state
      await handleStartThread();
    }
  };

  const handleBackToUserReply = () => {
    setStep('user-reply');
    setCreatedUserPersona(null);
    setPendingSimulationData(null);
  };

  const handleStartThread = async (overrideThreadData = null, overridePersonas = null) => {
    setStep('thread');
    setIsLoading(true);
    setApiError(null);

    // Clear previous messages without disconnecting (preserves client_id)
    wsClearMessages();

    // Wait for client_id if not available yet
    if (!clientId) {
      setApiError('WebSocket not connected. Please wait...');
      setIsLoading(false);
      return;
    }

    try {
      // Use override data if provided, otherwise use state
      const threadDataToUse = overrideThreadData || currentThreadData;
      const personasToUse = overridePersonas || personas;

      // Deep clone to avoid reference issues
      const clonedThreadData = JSON.parse(JSON.stringify(threadDataToUse));
      const clonedPersonas = JSON.parse(JSON.stringify(personasToUse));

      // Sort replies by created_at to ensure chronological order
      const sortedThreadData = clonedThreadData.map(thread => ({
        ...thread,
        replies: [...thread.replies].sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        )
      }));

      // Debug: Log the data being sent
      console.log('=== Starting Simulation ===');
      console.log('Client ID:', clientId);
      console.log('Thread Data:', JSON.stringify(sortedThreadData, null, 2));
      console.log('Personas count:', clonedPersonas.length);
      console.log('First persona:', clonedPersonas[0]);

      // Start backend simulation
      const response = await startSimulation(
        clientId, // Client ID from WebSocket
        sortedThreadData, // Use sorted thread data
        clonedPersonas, // Use cloned personas
        1.5 // Delay
      );

      console.log('Simulation started:', response);
      setThreadRunning(true);
      setIsPaused(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to start simulation:', error);
      console.error('Error details:', error.message);
      setApiError(error.message);
      setIsLoading(false);
      setThreadRunning(false);
    }
  };

  const handleDirectStart = async () => {
    setStep('user-reply'); // Go to user-reply instead of directly to thread
  };

  const handleThreadComplete = () => {
    setThreadRunning(false);
  };

  const handleReset = () => {
    setStep('initial');
    setThreadRunning(false);
    setIsPaused(false);
    setIsLoading(false);
    setApiError(null);
    setPersonas([...personasData]); // Reset to original personas
    setCurrentThreadData(threadData); // Reset to original thread data
    wsReset();
  };

  const handlePauseResume = () => {
    if (wsPaused) {
      // Resume
      setIsPaused(false);
      wsResume();
    } else {
      // Pause
      setIsPaused(true);
      wsPause();
    }
  };

  const handleBackToPersonas = () => {
    // Stop simulation by resetting WebSocket (will disconnect and reconnect)
    wsReset();

    setStep('personas');
    setThreadRunning(false);
    setIsPaused(false);
    setIsLoading(false);
    setApiError(null);
    setPersonas([...personasData]); // Reset to original personas
    setCurrentThreadData(threadData); // Reset to original thread data
  };

  const handleBackToHome = () => {
    // Stop simulation by resetting WebSocket (will disconnect and reconnect)
    wsReset();

    setStep('initial');
    setThreadRunning(false);
    setIsPaused(false);
    setIsLoading(false);
    setApiError(null);
    setPersonas([...personasData]); // Reset to original personas
    setCurrentThreadData(threadData); // Reset to original thread data
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
                <h3>{(currentThreadData[0]?.replies?.length || 0) + 1} Messages</h3>
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
          <PersonaPool personas={personas} />
          <div className="personas-control-panel">
            <button className="control-button home-button" onClick={handleBackToHome}>
              ← Home
            </button>
            <button className="control-button start-button" onClick={handleContinueToUserReply}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'user-reply' && (
        <UserReplyForm
          originalPost={{
            uri: currentThreadData[0].uri,
            author: currentThreadData[0].author,
            text: currentThreadData[0].text,
            created_at: currentThreadData[0].created_at,
            like_count: currentThreadData[0].like_count,
            reply_count: currentThreadData[0].reply_count,
            repost_count: currentThreadData[0].repost_count
          }}
          personas={personas}
          onSubmit={handleUserReplySubmit}
          onSkip={handleSkipUserReply}
          clientId={clientId}
          isConnected={isConnected}
          isLoading={isLoading}
          parentError={apiError}
        />
      )}

      {step === 'user-persona-preview' && createdUserPersona && (
        <PersonaPreview
          persona={createdUserPersona}
          onStartSimulation={handleStartSimulationFromPreview}
          onBack={handleBackToUserReply}
        />
      )}

      {step === 'thread' && (
        <div className="thread-screen">
          {/* Connection Status */}
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-indicator"></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>

          {/* Error Display */}
          {(apiError || wsError) && (
            <div className="error-banner">
              <strong>Error:</strong> {apiError || wsError?.message}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-banner">
              <div className="spinner"></div>
              Starting simulation...
            </div>
          )}

          {/* Progress Display */}
          {wsProgress && (
            <div className="progress-banner">
              {wsProgress.message} ({wsProgress.progress}%)
            </div>
          )}

          <ThreadView
            threadData={{
              thread_info: {
                thread_uri: currentThreadData[0]?.uri || '',
                thread_author: currentThreadData[0]?.author?.handle || '',
                thread_text: currentThreadData[0]?.text || '',
                thread_created_at: currentThreadData[0]?.created_at || '',
                total_messages: (currentThreadData[0]?.replies?.length || 0) + 1,
                total_replies: currentThreadData[0]?.replies?.length || 0
              },
              messages: [
                {
                  original: {
                    uri: currentThreadData[0]?.uri || '',
                    author: currentThreadData[0]?.author?.handle || '',
                    text: currentThreadData[0]?.text || '',
                    type: 'original_post',
                    created_at: currentThreadData[0]?.created_at || ''
                  },
                  agent_response: null
                }
              ]
            }}
            isRunning={threadRunning}
            isPaused={isPaused}
            onComplete={handleThreadComplete}
            wsMessages={wsMessages}
            isComplete={wsComplete}
            personas={personas}
          />
          <div className="control-panel">
            <button className="control-button home-button" onClick={handleBackToHome}>
              ← Home
            </button>
            <button className="control-button personas-button" onClick={handleBackToPersonas}>
              View Personas
            </button>
            <button className="control-button pause-button" onClick={handlePauseResume}>
              {wsPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationController;
