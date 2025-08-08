import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { Note, SectionType, NoteColor } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface Board {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface FirebaseNote extends Note {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

class FirebaseService {
  private currentBoardId: string | null = null;
  private userId: string | null = null;

  async initializeAuth() {
    try {
      const userCredential = await signInAnonymously(auth);
      this.userId = userCredential.user.uid;
      return this.userId;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  async createBoard(name: string = 'Retrospective Board'): Promise<string> {
    const boardId = uuidv4();
    const boardData: Omit<Board, 'id'> = {
      name,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: this.userId || 'anonymous'
    };

    try {
      await setDoc(doc(db, 'boards', boardId), boardData);
      this.currentBoardId = boardId;
      return boardId;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  }

  async getBoard(boardId: string): Promise<Board | null> {
    try {
      const boardDoc = await getDoc(doc(db, 'boards', boardId));
      if (boardDoc.exists()) {
        this.currentBoardId = boardId;
        return { id: boardDoc.id, ...boardDoc.data() } as Board;
      }
      return null;
    } catch (error) {
      console.error('Error getting board:', error);
      throw error;
    }
  }

  async addNote(boardId: string, note: Omit<Note, 'id'>): Promise<string> {
    const noteId = uuidv4();
    const noteData: FirebaseNote = {
      ...note,
      id: noteId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: this.userId || 'anonymous'
    };

    try {
      await setDoc(doc(db, 'boards', boardId, 'notes', noteId), noteData);
      return noteId;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  async updateNote(boardId: string, noteId: string, updates: Partial<Note>): Promise<void> {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'notes', noteId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(boardId: string, noteId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'boards', boardId, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async moveNote(boardId: string, noteId: string, toSection: SectionType): Promise<void> {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'notes', noteId), {
        section: toSection,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error moving note:', error);
      throw error;
    }
  }

  async changeNoteColor(boardId: string, noteId: string, color: NoteColor): Promise<void> {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'notes', noteId), {
        color,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error changing note color:', error);
      throw error;
    }
  }

  subscribeToNotes(boardId: string, callback: (notes: Note[]) => void): () => void {
    const notesQuery = query(
      collection(db, 'boards', boardId, 'notes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirebaseNote;
        notes.push({
          id: data.id,
          text: data.text,
          color: data.color,
          section: data.section,
          x: data.x,
          y: data.y
        });
      });
      callback(notes);
    }, (error) => {
      console.error('Error listening to notes:', error);
    });

    return unsubscribe;
  }

  async getAllNotes(boardId: string): Promise<Note[]> {
    try {
      const notesSnapshot = await getDocs(collection(db, 'boards', boardId, 'notes'));
      const notes: Note[] = [];
      notesSnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseNote;
        notes.push({
          id: data.id,
          text: data.text,
          color: data.color,
          section: data.section,
          x: data.x,
          y: data.y
        });
      });
      return notes;
    } catch (error) {
      console.error('Error getting all notes:', error);
      throw error;
    }
  }

  async importNotes(boardId: string, notes: Note[]): Promise<void> {
    const batch = writeBatch(db);
    
    notes.forEach((note) => {
      const noteRef = doc(db, 'boards', boardId, 'notes', note.id);
      const noteData: FirebaseNote = {
        ...note,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        createdBy: this.userId || 'anonymous'
      };
      batch.set(noteRef, noteData);
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error importing notes:', error);
      throw error;
    }
  }

  getCurrentBoardId(): string | null {
    return this.currentBoardId;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;