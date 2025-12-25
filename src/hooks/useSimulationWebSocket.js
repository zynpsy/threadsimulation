import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing WebSocket connection to simulation backend
 *
 * @returns {Object} WebSocket state and control functions
 */
const useSimulationWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [clientId, setClientId] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messageBufferRef = useRef([]);
  const isPausedRef = useRef(false);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        console.log('✓ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket Event]', data.type, data);

          switch (data.type) {
            case 'connected':
              // Backend assigned us a client_id
              console.log('✓ Received client ID:', data.client_id);
              setClientId(data.client_id);
              break;

            case 'persona_created':
              setPersonas(prev => [...prev, data.data]);
              break;

            case 'message_generated':
              // If paused, buffer the message instead of adding it
              if (isPausedRef.current) {
                messageBufferRef.current.push(data.data);
                console.log('Message buffered (paused):', messageBufferRef.current.length);
              } else {
                setMessages(prev => [...prev, data.data]);
              }
              break;

            case 'progress_update':
              setProgress(data.data);
              break;

            case 'completed':
              console.log('✓ Simulation completed', data.data);
              setIsComplete(true);
              setProgress(null);
              break;

            case 'error':
              console.error('❌ Simulation error:', data.error);
              setError({
                message: data.error,
                details: data.details
              });
              break;

            case 'paused':
              // Backend acknowledged pause
              console.log('✓ Backend confirmed pause');
              break;

            case 'resumed':
              // Backend acknowledged resume
              console.log('✓ Backend confirmed resume');
              break;

            case 'pong':
              // Connection alive confirmation
              break;

            default:
              console.log('Unknown WebSocket event type:', data.type);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError({
          message: 'WebSocket connection error',
          details: error
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect if not intentionally closed
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
          setError({
            message: 'Connection lost',
            details: 'Could not reconnect to server'
          });
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError({
        message: 'Failed to connect',
        details: err.message
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const clearMessages = useCallback(() => {
    // Clear messages and related state without disconnecting
    // Preserves WebSocket connection and client_id
    setMessages([]);
    setPersonas([]);
    setError(null);
    setIsComplete(false);
    setProgress(null);
    setIsPaused(false);
    isPausedRef.current = false;
    messageBufferRef.current = [];
    console.log('✓ Messages cleared (connection and client_id preserved)');
  }, []);

  const reset = useCallback(() => {
    // Disconnect WebSocket to cancel backend tasks
    disconnect();

    // Reset all state
    setMessages([]);
    setPersonas([]);
    setError(null);
    setIsComplete(false);
    setProgress(null);
    setIsPaused(false);
    setClientId(null);
    isPausedRef.current = false;
    messageBufferRef.current = [];

    // Reconnect after a short delay
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  const pause = useCallback(() => {
    // Set ref FIRST to immediately affect message handling
    isPausedRef.current = true;
    setIsPaused(true);
    console.log('Simulation paused - buffering messages');

    // Send pause command to backend
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pause' }));
    }
  }, []);

  const resume = useCallback(() => {
    console.log(`Resume called - buffer has ${messageBufferRef.current.length} messages`);

    // Clear pause flag FIRST so new messages go directly to display
    isPausedRef.current = false;
    setIsPaused(false);

    // Flush buffered messages AFTER clearing pause flag
    if (messageBufferRef.current.length > 0) {
      console.log(`Flushing ${messageBufferRef.current.length} buffered messages`);
      setMessages(prev => [...prev, ...messageBufferRef.current]);
      messageBufferRef.current = [];
    }

    // Send resume command to backend LAST
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resume' }));
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  // Cleanup on unmount (removed auto-connect - now controlled by parent)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Ping interval to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendPing();
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendPing]);

  return {
    isConnected,
    messages,
    personas,
    error,
    isComplete,
    progress,
    isPaused,
    clientId,
    connect,
    disconnect,
    reset,
    clearMessages,
    pause,
    resume
  };
};

export default useSimulationWebSocket;
