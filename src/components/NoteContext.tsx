import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type NotePayload = {
  context: string;
  title: string;
  subtitle?: string;
  copy: string;
};

type NoteContextValue = {
  note: NotePayload | null;
  openNote: (note: NotePayload) => void;
  closeNote: () => void;
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
};

const NoteContext = createContext<NoteContextValue | null>(null);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [note, setNote] = useState<NotePayload | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openNote = useCallback((payload: NotePayload) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNote(payload);
  }, []);
  const closeNote = useCallback(() => setNote(null), []);
  const value = useMemo(() => ({ note, openNote, closeNote, returnFocusRef }), [note, openNote, closeNote]);
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

export const useNote = () => {
  const value = useContext(NoteContext);
  if (!value) throw new Error('useNote must be used within NoteProvider.');
  return value;
};
