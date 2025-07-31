import React from 'react';
import { useDrop } from 'react-dnd';
import { StickyNote } from './StickyNote';
import { Note, NoteColor, SectionType } from '../types';
import './BoardSection.css';

interface BoardSectionProps {
  sectionId: SectionType;
  title: string;
  color: string;
  notes: Note[];
  onAddNote: (section: SectionType) => void;
  onUpdateNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
  onMoveNote: (noteId: string, toSection: SectionType) => void;
}

export const BoardSection: React.FC<BoardSectionProps> = ({
  sectionId,
  title,
  color,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onColorChange,
  onMoveNote,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'note',
    drop: (item: { id: string; section: SectionType }) => {
      if (item.section !== sectionId) {
        onMoveNote(item.id, sectionId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [sectionId, onMoveNote]);

  return (
    <div
      ref={drop as any}
      className={`board-section ${sectionId} ${isOver ? 'drag-over' : ''}`}
    >
      <h2 className="section-title" style={{ color }}>{title}</h2>
      <button 
        className="add-note-btn"
        onClick={() => onAddNote(sectionId)}
      >
        + Add Note
      </button>
      <div className="notes-container">
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            onColorChange={onColorChange}
          />
        ))}
      </div>
    </div>
  );
};