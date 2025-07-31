import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Note, NoteColor } from '../types';
import './StickyNote.css';

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ note, onUpdate, onDelete, onColorChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [showEditHint, setShowEditHint] = useState(!note.text);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'note',
    item: { id: note.id, section: note.section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [note.id, note.section]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(note.id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green'];

  return (
    <div
      ref={drag as any}
      className={`sticky-note ${note.color} ${isDragging ? 'dragging' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={() => !isEditing && setShowEditHint(false)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: `rotate(${Math.random() * 6 - 3}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      role="article"
      aria-label={`Sticky note: ${note.text || 'Empty note'}`}
      tabIndex={0}
    >
      <button className="delete-btn" onClick={() => onDelete(note.id)}>×</button>
      <div className="color-picker">
        {colors.map(color => (
          <button
            key={color}
            className={`color-btn ${color} ${note.color === color ? 'active' : ''}`}
            onClick={() => onColorChange(note.id, color)}
          />
        ))}
      </div>
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="note-textarea"
        />
      ) : (
        <div className="note-content">
          <p className="note-text">{note.text || 'Click to add text'}</p>
          {showEditHint && (
            <div className="edit-hint">
              <span className="edit-icon">✏️</span>
              <span className="edit-text">Double-click to edit</span>
            </div>
          )}
          <div className="drag-indicator" aria-hidden="true">
            <span className="drag-dots">⋮⋮</span>
          </div>
        </div>
      )}
    </div>
  );
};