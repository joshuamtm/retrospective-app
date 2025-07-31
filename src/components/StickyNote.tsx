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
    const lines = note.text.split('\n');
    const lineCount = Math.max(1, lines.length);
    
    // Calculate average characters per line for width
    const avgCharsPerLine = textLength > 0 ? textLength / lineCount : 0;
    
    // Dynamic width: 200px to 280px based on content
    const baseWidth = 200;
    const maxWidth = 280;
    const widthFactor = Math.min(1, avgCharsPerLine / 30); // ~30 chars for max width
    const width = baseWidth + (maxWidth - baseWidth) * widthFactor;
    
    // Dynamic height: More conservative calculation
    const baseHeight = 140; // Slightly larger base
    const lineHeight = 20; // More compact line height
    const padding = 60; // Account for header, counter, and padding
    const contentHeight = Math.max(1, lineCount) * lineHeight;
    const height = Math.max(baseHeight, contentHeight + padding);
    
    return { 
      width: Math.round(Math.max(200, Math.min(280, width))), 
      height: Math.round(Math.max(140, Math.min(400, height)))
    };
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
      // Reset height to auto to get the natural scroll height
      textarea.style.height = 'auto';
      // Set height to content height without scroll
      textarea.style.height = `${textarea.scrollHeight}px`;
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