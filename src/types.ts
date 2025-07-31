export type SectionType = 'keep' | 'stop' | 'start' | 'less' | 'more' | 'puzzling';

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green';

export interface Note {
  id: string;
  text: string;
  color: NoteColor;
  section: SectionType;
  x?: number;
  y?: number;
}

export interface Section {
  id: SectionType;
  title: string;
  color: string;
}