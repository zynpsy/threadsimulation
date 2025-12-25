import React from 'react';
import './ThreadMessage.css';

const ThreadMessage = ({ message, isAgent = false, isTyping = false, onAvatarClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const text = isAgent
    ? (message.agent_response?.text || message.original?.text || message.text)
    : (message.original?.text || message.text);

  const author = message.original?.author || message.author;
  const timestamp = message.original?.created_at || message.created_at;

  const handleAvatarClick = () => {
    if (onAvatarClick && author) {
      onAvatarClick(author);
    }
  };

  return (
    <div className={`thread-message ${isTyping ? 'typing' : ''}`}>
      <div className="message-header">
        <div
          className="message-avatar clickable"
          onClick={handleAvatarClick}
          title={`View @${author} persona`}
        >
          {author ? author.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="message-meta">
          <span className="message-author">@{author}</span>
          {timestamp && (
            <span className="message-time">{formatDate(timestamp)}</span>
          )}
        </div>
      </div>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  );
};

export default ThreadMessage;
