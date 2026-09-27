import { useEffect, useRef } from 'react';
import { useNote } from './NoteContext';

const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const NoteDrawer = () => {
  const { note, closeNote, returnFocusRef } = useNote();
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!note) {
      if (wasOpen.current) returnFocusRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNote();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [note, closeNote, returnFocusRef]);

  return (
    <>
      <button className={`note-drawer-backdrop ${note ? 'open' : ''}`} aria-hidden={!note} tabIndex={-1} onClick={closeNote} />
      <aside
        ref={drawerRef}
        className={`note-drawer ${note ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!note}
        aria-labelledby="note-drawer-title"
      >
        <div className="note-drawer-head">
          <span>Archive note</span>
          <button ref={closeRef} type="button" aria-label="Close note" onClick={closeNote}>×</button>
        </div>
        <div className="note-drawer-body">
          <div className="note-drawer-context">{note?.context}</div>
          <h2 id="note-drawer-title" className="note-drawer-title">{note?.title}</h2>
          {note?.subtitle && <div className="note-drawer-subtitle">{note.subtitle}</div>}
          <div className="note-drawer-rule" />
          <div className="note-drawer-copy">{note?.copy}</div>
          <div className="note-drawer-foot">Personal Music Archive / Notes</div>
        </div>
      </aside>
    </>
  );
};
