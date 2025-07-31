import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Note, NoteColor } from '../types';
import './StickyNote.css';

const MAX_CHARACTERS = 280;
const WARNING_THRESHOLD = 200;

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = React.memo(({ note, onUpdate, onDelete, onColorChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [showEditHint, setShowEditHint] = useState(!note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-sizing calculations
  const noteDimensions = useMemo(() => {
    const textLength = note.text.length;
    const lineCount = note.text.split('\n').length;
    const wordsPerLine = Math.max(1, Math.floor(textLength / lineCount));
    
    // Dynamic width: 180px to 300px based on content
    const baseWidth = 180;
    const maxWidth = 300;
    const widthFactor = Math.min(1, wordsPerLine / 20);
    const width = baseWidth + (maxWidth - baseWidth) * widthFactor;
    
    // Dynamic height: 120px minimum, grows with lines
    const baseHeight = 120;
    const lineHeight = 22;
    const padding = 40;
    const height = Math.max(baseHeight, lineCount * lineHeight + padding);
    
    return { width: Math.round(width), height: Math.round(height) };
  }, [note.text]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'note',
    item: { id: note.id, section: note.section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [note.id, note.section]);

  // Optimized handlers with useCallback
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setShowEditHint(false);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    onUpdate(note.id, text.slice(0, MAX_CHARACTERS));
  }, [note.id, text, onUpdate]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARACTERS) {
      setText(newText);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(note.text);
      setIsEditing(false);
    }
  }, [handleSave, note.text]);

  const handleSingleClick = useCallback(() => {
    if (!isEditing) {
      setShowEditHint(false);
      if ('ontouchstart' in window) {
        handleEdit();
      }
    }
  }, [isEditing, handleEdit]);

  // Character count and warning states
  const characterCount = text.length;
  const isNearLimit = characterCount >= WARNING_THRESHOLD;
  const isAtLimit = characterCount >= MAX_CHARACTERS;
  
  // Text category for visual hierarchy
  const textCategory = useMemo(() => {
    if (characterCount === 0) return 'empty';
    if (characterCount <= 20) return 'minimal';
    if (characterCount <= 150) return 'moderate';
    return 'full';
  }, [characterCount]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
      textarea.focus();
    }
  }, [isEditing, text]);

  const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green'];

  return (
    <div
      ref={drag as any}
      className={`sticky-note ${note.color} ${isDragging ? 'dragging' : ''} text-${textCategory}`}
      onDoubleClick={handleEdit}
      onClick={handleSingleClick}
      style={{
        width: `${noteDimensions.width}px`,
        height: `${noteDimensions.height}px`,
        transform: isDragging ? 'rotate(0deg) scale(1.05)' : `rotate(${(note.id.charCodeAt(0) % 7) - 3}deg)`,
        zIndex: isDragging ? 1000 : 1,
        boxShadow: isDragging 
          ? `0 8px 25px rgba(0, 0, 0, 0.3), 0 0 0 3px ${note.color === 'yellow' ? '#ffd700' : note.color === 'pink' ? '#ff99cc' : note.color === 'blue' ? '#66b3ff' : '#66ff66'}40`
          : undefined
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
        <div className="editing-container">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="note-textarea"
            placeholder="Enter your retrospective note..."
            maxLength={MAX_CHARACTERS}
          />
          <div className={`character-counter ${isNearLimit ? 'warning' : ''} ${isAtLimit ? 'limit' : ''}`}>
            {characterCount}/{MAX_CHARACTERS}
          </div>
        </div>
      ) : (
        <div className="note-content" ref={contentRef}>
          <p className="note-text">{note.text || 'Click to add text'}</p>
          {showEditHint && (
            <div className="edit-hint">
              <span className="edit-icon">✏️</span>
              <span className="edit-text">
                {'ontouchstart' in window ? 'Tap to edit' : 'Double-click to edit'}
              </span>
            </div>
          )}
          <div className="drag-indicator" aria-hidden="true">
            <span className="drag-dots">⋮⋮</span>
          </div>
        </div>
      )}
    </div>
  );
});