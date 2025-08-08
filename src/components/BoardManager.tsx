import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import firebaseService from '../services/firebase.service';
import './BoardManager.css';

const BoardManager: React.FC = () => {
  const [boardName, setBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    firebaseService.initializeAuth().catch((err) => {
      setError('Failed to initialize. Please refresh the page.');
      console.error(err);
    });
  }, []);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      setError('Please enter a board name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const boardId = await firebaseService.createBoard(boardName);
      navigate(`/board/${boardId}`);
    } catch (err) {
      setError('Failed to create board. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickStart = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const boardId = await firebaseService.createBoard(`Retrospective ${new Date().toLocaleDateString()}`);
      navigate(`/board/${boardId}`);
    } catch (err) {
      setError('Failed to create board. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="board-manager">
      <div className="board-manager-container">
        <h1>Team Retrospective Board</h1>
        <p className="subtitle">Create a new board or join an existing one</p>
        
        <div className="create-board-section">
          <h2>Create New Board</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter board name..."
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
              disabled={isCreating}
            />
            <button 
              onClick={handleCreateBoard} 
              disabled={isCreating || !boardName.trim()}
              className="primary-btn"
            >
              {isCreating ? 'Creating...' : 'Create Board'}
            </button>
          </div>
          
          <div className="divider">OR</div>
          
          <button 
            onClick={handleQuickStart} 
            disabled={isCreating}
            className="quick-start-btn"
          >
            {isCreating ? 'Creating...' : '🚀 Quick Start'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="info-section">
          <h3>How it works:</h3>
          <ul>
            <li>Create a new board or join an existing one via URL</li>
            <li>Share the board URL with your team</li>
            <li>Everyone can add, edit, and move notes in real-time</li>
            <li>Changes are automatically saved and synced</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BoardManager;