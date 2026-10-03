import { useEffect, useState } from 'react';
import { NoteBody, isSafeUrl } from './NoteBody';
import { useNote, type NotePayload } from './NoteContext';
import { SideDrawer } from './SideDrawer';

function NoteFoot({ note }: { note: NotePayload | null }) {
  const dates = [note?.written && `Written ${note.written}`, note?.updated && `Revised ${note.updated}`].filter(Boolean).join(' · ');
  return (
    <div className="note-drawer-foot">
      <div>Personal Music Archive / Notes{dates && <span className="note-drawer-dates"> · {dates}</span>}</div>
      {note?.sources && note.sources.length > 0 && (
        <ol className="note-sources" aria-label="Sources">
          {note.sources.map((source) => (
            <li key={source}>
              {isSafeUrl(source) ? (
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {source.replace(/^https?:\/\/(www\.)?/i, '')}
                </a>
              ) : (
                source
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** The single, app-level note drawer shared by Artist, Album and Song notes (a song's translation note is part of its note). */
export function NoteDrawer() {
  const { note, closeNote } = useNote();
  // Keep the last note while the drawer slides out.
  const [shown, setShown] = useState<NotePayload | null>(note);
  useEffect(() => {
    if (note) setShown(note);
  }, [note]);
  // Open at the requested section ("Translation note →" lands on 번역에 대하여).
  useEffect(() => {
    if (!note?.focus || shown !== note) return;
    document.getElementById(note.focus)?.scrollIntoView?.({ block: 'start' });
  }, [note, shown]);

  return (
    <SideDrawer open={Boolean(note)} onClose={closeNote} label="Archive note" labelledBy="note-drawer-title" closeLabel="Close note">
      <div className="note-drawer-context">{shown?.context}</div>
      <h2 id="note-drawer-title" className="note-drawer-title" lang={shown?.titleLang}>
        {shown?.title}
      </h2>
      {shown?.subtitle && <div className="note-drawer-subtitle">{shown.subtitle}</div>}
      <div className="note-drawer-rule" />
      <div className="note-drawer-copy" lang="ko">
        {shown?.copy && <NoteBody markdown={shown.copy} />}
        {shown?.extra}
      </div>
      <NoteFoot note={shown} />
    </SideDrawer>
  );
}
