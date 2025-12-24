import React, { useState, useEffect, useRef } from 'react';
import ThreadMessage from './ThreadMessage';
import { getAnonymousName } from '../utils/anonymizationUtils';
import './ThreadView.css';

const ThreadView = ({ threadData, isRunning, isPaused, onComplete }) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);

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

  useEffect(() => {
    if (!isRunning || !threadData || !threadData.messages || isPaused) {
      return;
    }

    if (currentIndex >= threadData.messages.length) {
      onComplete && onComplete();
      return;
    }

    const displayNextMessage = () => {
      setIsTyping(true);

      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, threadData.messages[currentIndex]]);
        setIsTyping(false);
        setCurrentIndex(prev => prev + 1);
      }, 1500); // 1.5s typing indicator
    };

    const timer = setTimeout(displayNextMessage, currentIndex === 0 ? 0 : 5000);

    return () => clearTimeout(timer);
  }, [isRunning, currentIndex, threadData, onComplete, isPaused]);

  if (!threadData) {
    return null;
  }

  return (
    <div className="thread-view-container">
      <div className="thread-header">
        <h2>Thread Simulation</h2>
        <p className="thread-info">
          {getAnonymousName(threadData.thread_info.thread_author)} · {threadData.thread_info.total_messages} messages
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
    </div>
  );
};

export default ThreadView;
