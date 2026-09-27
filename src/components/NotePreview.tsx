import type { EditorialBody } from '../editorial/types';
import { useNote } from './NoteContext';

export const NotePreview = ({
  kind,
  note,
  title,
  subtitle,
  className = '',
}: {
  kind: 'ARTIST' | 'ALBUM' | 'SONG';
  note?: EditorialBody;
  title: string;
  subtitle?: string;
  className?: string;
}) => {
  const { openNote } = useNote();
  if (!note?.short) return null;
  return (
    <div className={`note-preview ${className}`.trim()}>
      <div className="note-kicker"><span>{kind === 'SONG' ? 'Listening note' : 'Editorial note'}</span><span className="index">{kind}</span></div>
      <p>{note.short}</p>
      {note.full && (
        <button type="button" className="note-more" onClick={() => openNote({
          context: `${kind === 'SONG' ? 'Listening note' : 'Editorial note'} / ${kind[0]}${kind.slice(1).toLowerCase()}`,
          title,
          subtitle,
          copy: note.full ?? '',
        })}>
          Read full note →
        </button>
      )}
    </div>
  );
};
