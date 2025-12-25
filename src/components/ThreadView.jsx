import React, { useState, useEffect, useRef } from 'react';
import ThreadMessage from './ThreadMessage';
import PersonaModal from './PersonaModal';
import './ThreadView.css';

const ThreadView = ({ threadData, isRunning, isPaused, onComplete, wsMessages, isComplete, personas = [] }) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const hasInitializedWebSocket = useRef(false);
  const previousWsMessagesLength = useRef(0);

  // Track if we're using WebSocket messages or static data
  const useWebSocket = wsMessages && wsMessages.length > 0;

  // Handle avatar click to show persona modal
  const handleAvatarClick = (authorHandle) => {
    // Find persona by author handle (remove .bsky.social suffix if present)
    const cleanHandle = authorHandle.replace('.bsky.social', '');
    const persona = personas.find(p =>
      p.user_handle === authorHandle ||
      p.user_handle === cleanHandle ||
      p.user_handle.replace('.bsky.social', '') === cleanHandle
    );

    if (persona) {
      setSelectedPersona(persona);
    } else {
      console.log(`Persona not found for handle: ${authorHandle}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedPersona(null);
  };

  // Reset when switching to WebSocket mode
  useEffect(() => {
    if (useWebSocket && !hasInitializedWebSocket.current) {
      hasInitializedWebSocket.current = true;
      setDisplayedMessages([]);
      setCurrentIndex(0);
      previousWsMessagesLength.current = 0;
    }
  }, [useWebSocket]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (displayedMessages.length > 0) {
      // Use requestAnimationFrame for smoother scroll timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (leftColumnRef.current) {
            leftColumnRef.current.scrollTo({
              top: leftColumnRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
          if (rightColumnRef.current) {
            rightColumnRef.current.scrollTo({
              top: rightColumnRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 50);
      });
    }
  }, [displayedMessages]);

  // Handle WebSocket messages (real-time from backend)
  useEffect(() => {
    if (useWebSocket) {
      console.log('[ThreadView] WebSocket mode - wsMessages count:', wsMessages.length);
      console.log('[ThreadView] Current displayedMessages count:', displayedMessages.length);

      // Add original post as first message if not already present
      const messagesWithOriginalPost = [];

      if (threadData?.messages && threadData.messages.length > 0) {
        // Always add the original post first (from static data)
        messagesWithOriginalPost.push(threadData.messages[0]);
        console.log('[ThreadView] Added original post from static data');
      }

      // Add WebSocket messages (these are only replies, not the original post)
      messagesWithOriginalPost.push(...wsMessages);

      // Deduplicate messages based on URI
      const uniqueMessages = [];
      const seenUris = new Set();

      for (const message of messagesWithOriginalPost) {
        // Get URI from message (could be in original.uri or uri)
        const messageUri = message.original?.uri || message.uri;

        if (messageUri && !seenUris.has(messageUri)) {
          seenUris.add(messageUri);
          uniqueMessages.push(message);
        } else if (!messageUri) {
          // If no URI, add the message anyway (shouldn't happen in normal flow)
          uniqueMessages.push(message);
        }
      }

      console.log('[ThreadView] Total messages after deduplication:', uniqueMessages.length);
      console.log('[ThreadView] Duplicates removed:', messagesWithOriginalPost.length - uniqueMessages.length);

      setDisplayedMessages(uniqueMessages);

      // Show typing indicator briefly for new messages
      if (wsMessages.length > previousWsMessagesLength.current) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 800);
        previousWsMessagesLength.current = wsMessages.length;
        return () => clearTimeout(timer);
      }

      // Check if complete
      if (isComplete && onComplete) {
        onComplete();
      }
    }
  }, [wsMessages, useWebSocket, isComplete, onComplete, threadData]);

  // Handle static data (fallback mode)
  useEffect(() => {
    if (useWebSocket) {
      console.log('[ThreadView] Skipping static mode - using WebSocket');
      return; // Skip if using WebSocket
    }

    if (!isRunning || !threadData || !threadData.messages || isPaused) {
      return;
    }

    if (currentIndex >= threadData.messages.length) {
      onComplete && onComplete();
      return;
    }

    const displayNextMessage = () => {
      console.log('[ThreadView] Static mode - adding message index:', currentIndex);
      setIsTyping(true);

      setTimeout(() => {
        setDisplayedMessages(prev => {
          const newMessages = [...prev, threadData.messages[currentIndex]];
          console.log('[ThreadView] Static mode - total displayed:', newMessages.length);
          return newMessages;
        });
        setIsTyping(false);
        setCurrentIndex(prev => prev + 1);
      }, 1500); // 1.5s typing indicator
    };

    const timer = setTimeout(displayNextMessage, currentIndex === 0 ? 0 : 5000);

    return () => clearTimeout(timer);
  }, [isRunning, currentIndex, threadData, onComplete, isPaused, useWebSocket]);

  if (!threadData) {
    return null;
  }

  return (
    <div className="thread-view-container">
      <div className="thread-header">
        <h2>Thread Simulation</h2>
        <p className="thread-info">
          @{threadData.thread_info.thread_author} · {threadData.thread_info.total_messages} messages
        </p>
      </div>

      <div className="thread-split-view">
        <div className="thread-column original-column" ref={leftColumnRef}>
          <div className="column-header">
            <h3>Real Thread</h3>
            <span className="column-badge">Original</span>
          </div>
          <div className="messages-container">
            {displayedMessages.map((message, index) => (
              <ThreadMessage
                key={`original-${index}`}
                message={message}
                isAgent={false}
                onAvatarClick={handleAvatarClick}
              />
            ))}
            {isTyping && <ThreadMessage message={{ original: { author: '...', text: '' } }} isTyping={true} />}
          </div>
        </div>

        <div className="thread-divider"></div>

        <div className="thread-column agent-column" ref={rightColumnRef}>
          <div className="column-header">
            <h3>AI Simulation</h3>
            <span className="column-badge ai-badge">AI Generated</span>
          </div>
          <div className="messages-container">
            {displayedMessages.map((message, index) => (
              <ThreadMessage
                key={`agent-${index}`}
                message={message}
                isAgent={true}
                onAvatarClick={handleAvatarClick}
              />
            ))}
            {isTyping && <ThreadMessage message={{ original: { author: '...', text: '' } }} isTyping={true} />}
          </div>
        </div>
      </div>

      {displayedMessages.length > 0 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(displayedMessages.length / threadData.messages.length) * 100}%`
            }}
          ></div>
        </div>
      )}

      {selectedPersona && (
        <PersonaModal persona={selectedPersona} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ThreadView;
