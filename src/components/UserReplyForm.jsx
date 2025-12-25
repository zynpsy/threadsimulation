import React, { useState } from 'react';
import './UserReplyForm.css';

const UserReplyForm = ({ originalPost, personas, onSubmit, onSkip, clientId, isConnected, isLoading: parentLoading, parentError }) => {
  const [userName, setUserName] = useState('');
  const [userReply, setUserReply] = useState('');
  const [error, setError] = useState(null);

  // Use parent loading state if provided, otherwise use local state
  const isLoading = parentLoading !== undefined ? parentLoading : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (userName.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    if (!userReply.trim()) {
      setError('Please enter your reply');
      return;
    }

    if (userReply.length > 1000) {
      setError('Reply must be 1000 characters or less');
      return;
    }

    setError(null);

    try {
      await onSubmit({
        userName: userName.trim(),
        userReply: userReply.trim()
      });
    } catch (err) {
      console.error('Failed to create persona:', err);
      setError(err.message || 'Failed to create persona. Please try again.');
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="user-reply-form-container">
      <div className="user-reply-content">
        <h2>Join the Simulation</h2>
        <p className="user-reply-subtitle">
          Add your own persona to the simulation by replying to the original post
        </p>

        {/* Original Post Display */}
        <div className="original-post-card">
          <div className="post-header">
            <div className="post-avatar">
              {originalPost.author.display_name?.charAt(0) || '👤'}
            </div>
            <div className="post-author-info">
              <div className="post-display-name">{originalPost.author.display_name}</div>
              <div className="post-handle">@{originalPost.author.handle}</div>
            </div>
          </div>
          <div className="post-text">{originalPost.text}</div>
          <div className="post-metadata">
            <span className="post-date">
              {new Date(originalPost.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="post-stats">
              ❤️ {originalPost.like_count} · 💬 {originalPost.reply_count} · 🔁 {originalPost.repost_count}
            </span>
          </div>
        </div>

        {/* User Reply Form */}
        <form className="reply-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              disabled={isLoading}
              className="form-input"
            />
            <div className="form-hint">
              {userName.length}/50 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="userReply">Your Reply</label>
            <textarea
              id="userReply"
              value={userReply}
              onChange={(e) => setUserReply(e.target.value)}
              placeholder="What do you think about this post?"
              maxLength={1000}
              rows={6}
              disabled={isLoading}
              className="form-textarea"
            />
            <div className="form-hint">
              {userReply.length}/1000 characters
            </div>
          </div>

          {/* Error Display */}
          {(error || parentError) && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error || parentError}
            </div>
          )}

          {/* Connection Status Warning */}
          {!isConnected && (
            <div className="form-warning">
              <span className="warning-icon">🔌</span>
              Connecting to server... Please wait.
            </div>
          )}

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="skip-button"
            >
              Skip This Step
            </button>
            <button
              type="submit"
              disabled={isLoading || !isConnected}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Persona...
                </>
              ) : !isConnected ? (
                '⏳ Connecting...'
              ) : (
                'Create My Persona →'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-icon">ℹ️</div>
          <div className="info-text">
            <strong>What happens next?</strong>
            <ul>
              <li>AI will analyze your reply to create a unique persona</li>
              <li>You'll get a Bluesky username based on your name</li>
              <li>Your persona will be added to the simulation</li>
              <li>Watch how AI agents interact with your contribution!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReplyForm;
