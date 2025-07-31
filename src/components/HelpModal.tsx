import React from 'react';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>How to Use the Retrospective Board</h2>
        
        <h3>What is a Retrospective?</h3>
        <p>
          A retrospective is a team meeting held at the end of a project sprint or iteration 
          to reflect on what happened and identify improvements for the future. It's a key 
          practice in Agile methodologies that helps teams continuously improve their processes.
        </p>

        <h3>The Sections</h3>
        <ul>
          <li><strong>KEEP:</strong> Things that worked well and should continue</li>
          <li><strong>STOP:</strong> Things that didn't work and should be discontinued</li>
          <li><strong>START:</strong> New ideas or practices to try</li>
          <li><strong>LESS:</strong> Things to reduce or scale back</li>
          <li><strong>MORE:</strong> Things to increase or do more of</li>
          <li><strong>PUZZLING:</strong> Questions or unclear items needing discussion</li>
        </ul>

        <h3>How to Use This Board</h3>
        <ol>
          <li><strong>Add Notes:</strong> Click "Add Note" in any section to create a new sticky note</li>
          <li><strong>Edit Notes:</strong> Double-click on a note to edit its content</li>
          <li><strong>Move Notes:</strong> Drag and drop notes between sections</li>
          <li><strong>Change Colors:</strong> Hover over a note and click the color dots to change its color</li>
          <li><strong>Delete Notes:</strong> Click the × button on a note to remove it</li>
          <li><strong>Export to PDF:</strong> Click the "Export to PDF" button to save your board</li>
        </ol>

        <h3>Tips for a Great Retrospective</h3>
        <ul>
          <li>Be honest but constructive</li>
          <li>Focus on processes, not people</li>
          <li>Keep discussions solution-oriented</li>
          <li>Ensure everyone participates</li>
          <li>Follow up on action items from previous retrospectives</li>
        </ul>
      </div>
    </div>
  );
};