import React from 'react';
import { getAvatarEmoji } from '../utils/avatarUtils';
import './PersonaModal.css';

const PersonaModal = ({ persona, onClose }) => {
  if (!persona) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <div className="modal-avatar emoji-modal-avatar">
            {getAvatarEmoji(persona.user_handle)}
          </div>
          <div className="modal-user-info">
            <h2>@{persona.user_handle}</h2>
            <div className="modal-stats">
              <span className="stat-item">
                <strong>{persona.statistics.total_posts}</strong> posts
              </span>
              <span className="stat-item">
                <strong>{persona.statistics.total_replies}</strong> replies
              </span>
              <span className="stat-item">
                <strong>{persona.statistics.total_likes}</strong> likes
              </span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <h3>AI Persona Analysis</h3>
          <p className="persona-analysis-text">{persona.persona_analysis}</p>

          {persona.sample_comments && persona.sample_comments.length > 0 && (
            <div className="sample-comments-section">
              <h4>Sample Comment</h4>
              <div className="sample-comment">
                <p>"{persona.sample_comments[0].text}"</p>
                <span className="comment-meta">
                  {persona.sample_comments[0].like_count} likes · {persona.sample_comments[0].type}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;
