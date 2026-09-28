import { useEffect, useState } from 'react';
import { useNote, type NotePayload } from './NoteContext';
import { SideDrawer } from './SideDrawer';

/** The single, app-level note drawer shared by Artist, Album and Song notes. */
export function NoteDrawer() {
  const { note, closeNote } = useNote();
  // Keep the last note while the drawer slides out.
  const [shown, setShown] = useState<NotePayload | null>(note);
  useEffect(() => {
    if (note) setShown(note);
  }, [note]);

  return (
    <SideDrawer open={Boolean(note)} onClose={closeNote} label="Archive note" labelledBy="note-drawer-title" closeLabel="Close note">
      <div className="note-drawer-context">{shown?.context}</div>
      <h2 id="note-drawer-title" className="note-drawer-title" lang={shown?.titleLang}>
        {shown?.title}
      </h2>
      {shown?.subtitle && <div className="note-drawer-subtitle">{shown.subtitle}</div>}
      <div className="note-drawer-rule" />
      <div className="note-drawer-copy" lang="ko">
        {shown?.copy}
      </div>
      <div className="note-drawer-foot">Personal Music Archive / Notes</div>
    </SideDrawer>
  );
}
