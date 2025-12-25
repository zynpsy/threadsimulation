import React from 'react';
import { getAvatarEmoji } from '../utils/avatarUtils';
import './PersonaPreview.css';

const PersonaPreview = ({ persona, onStartSimulation, onBack }) => {
  if (!persona) return null;

  return (
    <div className="persona-preview-container">
      <div className="persona-preview-content">
        {/* Header */}
        <div className="preview-header">
          <h1>Your Persona is Ready!</h1>
          <p className="preview-subtitle">
            AI has analyzed your reply and created a unique persona for you
          </p>
        </div>

        {/* Persona Card */}
        <div className="persona-card">
          <div className="persona-card-header">
            <div className="persona-avatar emoji-avatar">
              {getAvatarEmoji(persona.user_handle)}
            </div>
            <div className="persona-user-info">
              <h2>@{persona.user_handle}</h2>
              {persona.statistics && (
                <div className="persona-stats">
                  <span className="stat-item">
                    <strong>{persona.statistics.total_posts || 0}</strong> posts
                  </span>
                  <span className="stat-item">
                    <strong>{persona.statistics.total_replies || 0}</strong> replies
                  </span>
                  <span className="stat-item">
                    <strong>{persona.statistics.total_likes || 0}</strong> likes
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="persona-card-body">
            <h3>AI Persona Analysis</h3>
            <p className="persona-analysis-text">{persona.persona_analysis}</p>

            {persona.sample_comments && persona.sample_comments.length > 0 && (
              <div className="sample-comments-section">
                <h4>Your Sample Comment</h4>
                <div className="sample-comment">
                  <p>"{persona.sample_comments[0].text}"</p>
                  <span className="comment-meta">
                    {persona.sample_comments[0].like_count || 0} likes · {persona.sample_comments[0].type || 'reply'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="preview-actions">
          {onBack && (
            <button className="preview-button back-button" onClick={onBack}>
              ← Edit My Reply
            </button>
          )}
          <button className="preview-button start-button" onClick={onStartSimulation}>
            Start Simulation →
          </button>
        </div>

        {/* Info Box */}
        <div className="preview-info-box">
          <div className="info-icon">✨</div>
          <div className="info-text">
            <strong>What happens next?</strong>
            <p>
              Your persona will join other AI-generated personas in a simulated conversation.
              Watch how the AI agents interact with each other in real-time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaPreview;
