import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';
import { BoardSection } from './BoardSection';
import { HelpModal } from './HelpModal';
import { EmptyState } from './EmptyState';
import { Note, NoteColor, Section, SectionType } from '../types';
import firebaseService, { Board as FirebaseBoard } from '../services/firebase.service';
import * as html2canvas from 'html-to-image';
import { jsPDF } from 'jspdf';
import { exportToJSON } from '../utils/pdfImport';
import './Board.css';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: TouchBackend,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: HTML5Backend,
    },
  ],
};

const sections: Section[] = [
  { id: 'keep', title: 'KEEP', color: '#0099cc' },
  { id: 'stop', title: 'STOP', color: '#ff3333' },
  { id: 'start', title: 'START', color: '#00cc66' },
  { id: 'less', title: 'LESS', color: '#ff6666' },
  { id: 'more', title: 'MORE', color: '#66cc66' },
  { id: 'puzzling', title: '?', color: '#0066cc' }
];

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [board, setBoard] = useState<FirebaseBoard | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showImportMessage, setShowImportMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!boardId) {
      navigate('/');
      return;
    }

    const initializeBoard = async () => {
      try {
        await firebaseService.initializeAuth();
        
        const boardData = await firebaseService.getBoard(boardId);
        if (!boardData) {
          setError('Board not found');
          setIsLoading(false);
          return;
        }
        
        setBoard(boardData);
        
        unsubscribeRef.current = firebaseService.subscribeToNotes(boardId, (updatedNotes) => {
          setNotes(updatedNotes);
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing board:', err);
        setError('Failed to load board');
        setIsLoading(false);
      }
    };

    initializeBoard();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [boardId, navigate]);

  const addNote = async (section: SectionType) => {
    if (!boardId) return;
    
    try {
      await firebaseService.addNote(boardId, {
        text: '',
        color: 'yellow',
        section
      });
    } catch (err) {
      console.error('Error adding note:', err);
      setShowImportMessage('Failed to add note');
      setTimeout(() => setShowImportMessage(null), 3000);
    }
  };

  const updateNote = async (id: string, text: string) => {
    if (!boardId) return;
    
    try {
      await firebaseService.updateNote(boardId, id, { text });
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const deleteNote = async (id: string) => {
    if (!boardId) return;
    
    try {
      await firebaseService.deleteNote(boardId, id);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const changeNoteColor = async (id: string, color: NoteColor) => {
    if (!boardId) return;
    
    try {
      await firebaseService.changeNoteColor(boardId, id, color);
    } catch (err) {
      console.error('Error changing note color:', err);
    }
  };

  const moveNote = async (noteId: string, toSection: SectionType) => {
    if (!boardId) return;
    
    try {
      await firebaseService.moveNote(boardId, noteId, toSection);
    } catch (err) {
      console.error('Error moving note:', err);
    }
  };

  const copyShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareUrlCopied(true);
      setTimeout(() => setShareUrlCopied(false), 2000);
    });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('retrospective-board');
    if (!element) return;

    try {
      const dataUrl = await html2canvas.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f5f5f5'
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [element.offsetWidth, element.offsetHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
      
      pdf.setProperties({
        title: `${board?.name || 'Retrospective Board'} Export`,
        subject: 'Team Retrospective',
        creator: 'Retrospective App',
        keywords: 'retrospective, agile, team'
      });

      const jsonData = exportToJSON(notes);
      pdf.setFileId(jsonData);

      pdf.save(`${board?.name || 'retrospective'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const exportJSON = () => {
    const jsonData = exportToJSON(notes);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board?.name || 'retrospective'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!boardId) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedNotes = JSON.parse(content) as Note[];
        
        await firebaseService.importNotes(boardId, importedNotes);
        
        setShowImportMessage(`Successfully imported ${importedNotes.length} notes!`);
        setTimeout(() => setShowImportMessage(null), 3000);
      } catch (error) {
        console.error('Import error:', error);
        setShowImportMessage('Failed to import file. Please ensure it\'s a valid retrospective export.');
        setTimeout(() => setShowImportMessage(null), 5000);
      }
    };

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      setShowImportMessage('Please select a .json file exported from this application.');
      setTimeout(() => setShowImportMessage(null), 5000);
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const clearBoard = async () => {
    if (!boardId) return;
    
    if (notes.length > 0 && window.confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      try {
        const deletePromises = notes.map(note => firebaseService.deleteNote(boardId, note.id));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error('Error clearing board:', err);
        setShowImportMessage('Failed to clear board');
        setTimeout(() => setShowImportMessage(null), 3000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="App">
        <header className="app-header">
          <div className="header-left">
            <h1>{board?.name || 'Team Retrospective Board'}</h1>
            <button 
              className={`share-btn ${shareUrlCopied ? 'copied' : ''}`}
              onClick={copyShareUrl}
            >
              {shareUrlCopied ? '✓ Copied!' : '🔗 Share Board'}
            </button>
          </div>
          <div className="header-buttons">
            <button className="help-btn" onClick={() => setShowHelp(true)}>
              ? Help
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button className="import-btn" onClick={() => fileInputRef.current?.click()}>
              📥 Import
            </button>
            <div className="export-dropdown">
              <button className="export-btn" onClick={exportToPDF}>
                📄 Export PDF
              </button>
              <button className="export-btn secondary" onClick={exportJSON}>
                💾 Export Data
              </button>
            </div>
            <button className="clear-btn" onClick={clearBoard}>
              🗑️ Clear Board
            </button>
            <button className="home-btn" onClick={() => navigate('/')}>
              🏠 Home
            </button>
          </div>
        </header>

        {showImportMessage && (
          <div className={`import-message ${showImportMessage.includes('Success') ? 'success' : 'error'}`}>
            {showImportMessage}
          </div>
        )}

        <div id="retrospective-board" className="retrospective-board">
          <div className="board-background">
            <div className="center-circle">
              <span className="question-mark">?</span>
            </div>
            {sections.map(section => (
              <BoardSection
                key={section.id}
                sectionId={section.id}
                title={section.title}
                color={section.color}
                notes={notes.filter(note => note.section === section.id)}
                onAddNote={addNote}
                onUpdateNote={updateNote}
                onDeleteNote={deleteNote}
                onColorChange={changeNoteColor}
                onMoveNote={moveNote}
              />
            ))}
            {notes.length === 0 && (
              <EmptyState onGetStarted={() => addNote('keep')} />
            )}
          </div>
        </div>

        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </DndProvider>
  );
};

export default Board;