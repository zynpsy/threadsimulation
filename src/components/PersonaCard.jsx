import React from 'react';
import './PersonaCard.css';

const PersonaCard = ({ persona }) => {
  return (
    <div className="persona-card">
      <div className="persona-header">
        <div className="persona-avatar">
          {persona.user_handle.charAt(0).toUpperCase()}
        </div>
        <div className="persona-info">
          <h3 className="persona-handle">@{persona.user_handle}</h3>
          <p className="persona-stats">
            {persona.statistics.total_posts} posts · {persona.statistics.total_replies} replies · {persona.statistics.total_likes} likes
          </p>
        </div>
      </div>
      <div className="persona-analysis">
        <p>{persona.persona_analysis}</p>
      </div>
    </div>
  );
};

export default PersonaCard;
