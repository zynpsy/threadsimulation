import React, { useState, useEffect } from 'react';
import ThreadMessage from './ThreadMessage';
import './ThreadView.css';

const ThreadView = ({ threadData, isRunning, onComplete }) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isRunning || !threadData || !threadData.messages) {
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
  }, [isRunning, currentIndex, threadData, onComplete]);

  if (!threadData) {
    return null;
  }

  return (
    <div className="thread-view-container">
      <div className="thread-header">
        <h2>Thread Simülasyonu</h2>
        <p className="thread-info">
          {threadData.thread_info.thread_author} · {threadData.thread_info.total_messages} mesaj
        </p>
      </div>

      <div className="thread-split-view">
        <div className="thread-column original-column">
          <div className="column-header">
            <h3>Gerçek Thread</h3>
            <span className="column-badge">Orijinal</span>
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

        <div className="thread-column agent-column">
          <div className="column-header">
            <h3>AI Simülasyonu</h3>
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
