import { useEffect, useId, useRef } from 'react';
import { NoteContent } from '../NoteContent';
import type { NotePayload } from '../NoteContext';

/**
 * Now Playing's song note, opened in the page beside the cover and lyrics
 * rather than over them: no backdrop, nothing blocked, so lyrics and the
 * transport keep working while it is open. Escape (with focus inside) or the
 * close button closes it and returns focus to whatever opened it.
 */
export function NoteColumn({ note, onClose }: { note: NotePayload; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus();
    };
  }, []);

  return (
    <aside
      className="player-note-panel"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        onClose();
      }}
    >
      <div className="player-note-panel-head">
        <span>Listening note</span>
        <button ref={closeRef} type="button" aria-label="Close note" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="player-note-panel-body">
        <NoteContent note={note} titleId={titleId} />
      </div>
    </aside>
  );
}
