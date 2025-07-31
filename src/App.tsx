import React, { useState, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BoardSection } from './components/BoardSection';
import { HelpModal } from './components/HelpModal';
import { EmptyState } from './components/EmptyState';
import { Note, NoteColor, Section, SectionType } from './types';
import { v4 as uuidv4 } from 'uuid';
import * as html2canvas from 'html-to-image';
import { jsPDF } from 'jspdf';
import { exportToJSON, importFromJSON } from './utils/pdfImport';
import './App.css';

const sections: Section[] = [
  { id: 'keep', title: 'KEEP', color: '#0099cc' },
  { id: 'stop', title: 'STOP', color: '#ff3333' },
  { id: 'start', title: 'START', color: '#00cc66' },
  { id: 'less', title: 'LESS', color: '#ff6666' },
  { id: 'more', title: 'MORE', color: '#66cc66' },
  { id: 'puzzling', title: '?', color: '#0066cc' }
];

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showImportMessage, setShowImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNote = (section: SectionType) => {
    const newNote: Note = {
      id: uuidv4(),
      text: '',
      color: 'yellow',
      section
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, text: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, text } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const changeNoteColor = (id: string, color: NoteColor) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, color } : note
    ));
  };

  const moveNote = (noteId: string, toSection: SectionType) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, section: toSection } : note
    ));
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
      
      // Add metadata for easier import
      pdf.setProperties({
        title: 'Retrospective Board Export',
        subject: 'Team Retrospective',
        creator: 'Retrospective App',
        keywords: 'retrospective, agile, team'
      });

      // Also save JSON data for reliable import
      const jsonData = exportToJSON(notes);
      pdf.setFileId(jsonData);

      pdf.save(`retrospective-${new Date().toISOString().split('T')[0]}.pdf`);
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
    a.download = `retrospective-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedNotes = importFromJSON(content);
        setNotes(importedNotes);
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

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const clearBoard = () => {
    if (notes.length > 0 && window.confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      setNotes([]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header className="app-header">
          <h1>Team Retrospective Board</h1>
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
}

export default App;
