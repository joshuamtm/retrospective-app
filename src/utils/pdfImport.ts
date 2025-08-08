import Tesseract from 'tesseract.js';
import { Note, NoteColor, SectionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Section boundaries based on the layout
const SECTION_BOUNDS = {
  keep: { x: 0.25, y: 0, width: 0.5, height: 0.3 },
  stop: { x: 0, y: 0.3, width: 0.3, height: 0.4 },
  start: { x: 0.7, y: 0.3, width: 0.3, height: 0.4 },
  less: { x: 0, y: 0.7, width: 0.35, height: 0.3 },
  more: { x: 0.65, y: 0.7, width: 0.35, height: 0.3 },
  puzzling: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 }
};

// Color detection based on RGB values
const detectNoteColor = (r: number, g: number, b: number): NoteColor => {
  // Calculate color distances
  const colors = {
    yellow: { r: 255, g: 215, b: 0, distance: 0 },
    pink: { r: 255, g: 153, b: 204, distance: 0 },
    blue: { r: 102, g: 179, b: 255, distance: 0 },
    green: { r: 102, g: 255, b: 102, distance: 0 }
  };

  // Calculate Euclidean distance for each color
  Object.keys(colors).forEach(color => {
    const c = colors[color as keyof typeof colors];
    c.distance = Math.sqrt(
      Math.pow(r - c.r, 2) + 
      Math.pow(g - c.g, 2) + 
      Math.pow(b - c.b, 2)
    );
  });

  // Return the color with minimum distance
  let minColor: NoteColor = 'yellow';
  let minDistance = Infinity;
  
  Object.entries(colors).forEach(([color, data]) => {
    if (data.distance < minDistance) {
      minDistance = data.distance;
      minColor = color as NoteColor;
    }
  });

  return minColor;
};

// Determine which section a note belongs to based on its position
const detectSection = (x: number, y: number, width: number, height: number): SectionType => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  for (const [section, bounds] of Object.entries(SECTION_BOUNDS)) {
    if (
      centerX >= bounds.x &&
      centerX <= bounds.x + bounds.width &&
      centerY >= bounds.y &&
      centerY <= bounds.y + bounds.height
    ) {
      return section as SectionType;
    }
  }

  // Default to 'puzzling' if position is unclear
  return 'puzzling';
};

export const importFromPDF = async (file: File): Promise<Note[]> => {
  try {
    // Convert PDF to image
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Create a canvas to render the PDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    // For now, we'll use a simpler approach with file input
    // In a production app, you'd use pdf.js to render the PDF to canvas
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          // Use Tesseract to extract text
          const result = await Tesseract.recognize(
            canvas,
            'eng',
            {
              logger: m => console.log(m)
            }
          );

          const notes: Note[] = [];
          
          // Process each text block
          result.data.blocks?.forEach(block => {
            if (block.text.trim() && 
                !block.text.includes('KEEP') && 
                !block.text.includes('STOP') && 
                !block.text.includes('START') && 
                !block.text.includes('LESS') && 
                !block.text.includes('MORE') &&
                !block.text.includes('Team Retrospective Board') &&
                !block.text.includes('Help') &&
                !block.text.includes('Export')) {
              
              // Get position relative to image size
              const relX = block.bbox.x0 / img.width;
              const relY = block.bbox.y0 / img.height;
              const relWidth = (block.bbox.x1 - block.bbox.x0) / img.width;
              const relHeight = (block.bbox.y1 - block.bbox.y0) / img.height;

              // Detect section based on position
              const section = detectSection(relX, relY, relWidth, relHeight);

              // Sample pixel color from the center of the text block
              const centerX = block.bbox.x0 + (block.bbox.x1 - block.bbox.x0) / 2;
              const centerY = block.bbox.y0 + (block.bbox.y1 - block.bbox.y0) / 2;
              const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
              const color = detectNoteColor(pixelData[0], pixelData[1], pixelData[2]);

              notes.push({
                id: uuidv4(),
                text: block.text.trim(),
                color: color,
                section: section
              });
            }
          });

          URL.revokeObjectURL(url);
          resolve(notes);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load PDF as image'));
      };

      // For demo purposes, we'll need the user to provide an image version
      // In production, use pdf.js to properly render PDF to canvas
      alert('Please note: For this prototype, please export your retrospective board as an image (PNG/JPG) instead of PDF for importing. Full PDF import would require additional setup.');
      img.src = url;
    });

  } catch (error) {
    console.error('Error importing PDF:', error);
    throw new Error('Failed to import PDF. Please ensure it was exported from this application.');
  }
};

// Simpler JSON-based import/export for better reliability
export const exportToJSON = (notes: Note[]): string => {
  return JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    notes: notes
  }, null, 2);
};

export const importFromJSON = (jsonString: string): Note[] => {
  try {
    const data = JSON.parse(jsonString);
    if (data.version !== '1.0') {
      throw new Error('Unsupported file version');
    }
    return data.notes.map((note: Note) => ({
      ...note,
      id: uuidv4() // Generate new IDs to avoid conflicts
    }));
  } catch (error) {
    throw new Error('Invalid retrospective file format');
  }
};