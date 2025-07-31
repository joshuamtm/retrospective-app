import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  onGetStarted: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onGetStarted }) => {
  return (
    <div className="empty-state" role="region" aria-label="Getting started guide">
      <div className="empty-state-content">
        <h2>Welcome to Your Retrospective Board! 🎯</h2>
        <p className="empty-state-description">
          Start your team retrospective by adding notes to reflect on your recent sprint or project.
        </p>
        
        <div className="section-guide">
          <div className="guide-item keep">
            <h3>KEEP</h3>
            <p>What worked well and should continue?</p>
          </div>
          <div className="guide-item stop">
            <h3>STOP</h3>
            <p>What didn't work and should be discontinued?</p>
          </div>
          <div className="guide-item start">
            <h3>START</h3>
            <p>What new ideas should we try?</p>
          </div>
          <div className="guide-item less">
            <h3>LESS</h3>
            <p>What should we reduce or scale back?</p>
          </div>
          <div className="guide-item more">
            <h3>MORE</h3>
            <p>What should we do more of?</p>
          </div>
          <div className="guide-item puzzling">
            <h3>PUZZLING (?)</h3>
            <p>What questions or unclear items need discussion?</p>
          </div>
        </div>

        <div className="empty-state-actions">
          <button className="get-started-btn" onClick={onGetStarted}>
            Get Started - Add Your First Note
          </button>
          <p className="tip">
            💡 <strong>Tip:</strong> Click "Add Note" in any section, or drag notes between sections to reorganize
          </p>
        </div>
      </div>
    </div>
  );
};