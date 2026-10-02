import { Link } from 'react-router-dom';
import { usePageTitle } from '../app/pageTitle';
import { useNote } from '../components/NoteContext';
import { albumNotes } from '../editorial/albums';
import { artistNotes } from '../editorial/artists';
import { namesMatch } from '../editorial/lookup';
import { songNotes } from '../editorial/songs';
import type { AlbumNote, ArtistNote, EditorialBody, NoteKind, SongNote } from '../editorial/types';
import { pluralise } from '../lib/format';
import { usePlay } from '../playback/hooks';
import { curatedTranslations, type CuratedTranslation } from '../translation/curated';
import { SPEECH_LEVEL_LABEL } from '../translation/curated/types';
import { detectLineLanguage } from '../translation/languageDetect';

interface ArtistEntry {
  artist: ArtistNote;
  albums: AlbumNote[];
  songs: SongNote[];
  translations: CuratedTranslation[];
}

/** Every note and translation in the archive, grouped under its artist. Pure data: no Spotify request. */
export function buildArchiveIndex(
  artists: readonly ArtistNote[] = artistNotes,
  albums: readonly AlbumNote[] = albumNotes,
  songs: readonly SongNote[] = songNotes,
  translations: readonly CuratedTranslation[] = curatedTranslations,
): { entries: ArtistEntry[]; unattached: CuratedTranslation[] } {
  const attached = new Set<CuratedTranslation>();
  const entries = [...artists]
    .sort((a, b) => a.names[0]!.localeCompare(b.names[0]!, 'en', { sensitivity: 'base' }))
    .map((artist) => {
      const own = translations.filter((t) => namesMatch(artist.names, t.artistNames));
      own.forEach((t) => attached.add(t));
      return {
        artist,
        albums: albums.filter((a) => a.artist === artist.key).sort((a, b) => (a.releaseYear ?? 0) - (b.releaseYear ?? 0)),
        songs: songs.filter((s) => s.artist === artist.key).sort((a, b) => a.titles[0]!.localeCompare(b.titles[0]!)),
        translations: own.sort((a, b) => a.titles[0]!.localeCompare(b.titles[0]!)),
      };
    });
  return { entries, unattached: translations.filter((t) => !attached.has(t)) };
}

function ReadMore({ kind, note, title, subtitle }: { kind: NoteKind; note: EditorialBody; title: string; subtitle?: string }) {
  const { openNote } = useNote();
  if (!note.full?.trim()) return null;
  const heading = kind === 'SONG' ? 'Listening note' : 'Editorial note';
  const label = kind === 'SONG' ? 'Song' : kind === 'ALBUM' ? 'Album' : 'Artist';
  return (
    <button
      type="button"
      className="row-play"
      aria-haspopup="dialog"
      aria-label={`Read the note on ${title}`}
      onClick={() =>
        openNote({
          context: `${heading} / ${label}`,
          title,
          subtitle,
          copy: note.full ?? '',
          titleLang: detectLineLanguage(title),
          written: note.written,
          updated: note.updated,
          sources: note.sources,
        })
      }
    >
      Read
    </button>
  );
}

function PlayTrack({ trackIds, title }: { trackIds: readonly string[]; title: string }) {
  const play = usePlay();
  const id = trackIds[0];
  if (!id) return null;
  return (
    <button type="button" className="row-play" aria-label={`Play ${title}`} onClick={() => play({ uris: [`spotify:track:${id}`] }, { openNowPlaying: true })}>
      Play
    </button>
  );
}

function TranslationRow({ translation }: { translation: CuratedTranslation }) {
  const title = translation.titles[0]!;
  return (
    <li className="archive-row">
      <span className="archive-kind">Translation</span>
      <span className="archive-text">
        <b lang={detectLineLanguage(title)}>{title}</b>
        <span className="archive-meta" lang="ko">
          {SPEECH_LEVEL_LABEL[translation.brief.register]} · {translation.brief.speaker} → {translation.brief.addressee}
        </span>
      </span>
      <span className="archive-actions">
        <PlayTrack trackIds={translation.trackIds} title={title} />
      </span>
    </li>
  );
}

function ArtistSection({ entry }: { entry: ArtistEntry }) {
  const { artist, albums, songs, translations } = entry;
  const name = artist.names[0]!;
  const artistId = artist.artistIds[0];
  const count = [
    albums.length ? pluralise(albums.length, 'album note') : null,
    songs.length ? pluralise(songs.length, 'listening note') : null,
    translations.length ? pluralise(translations.length, 'translation') : null,
  ].filter(Boolean);
  return (
    <section className="archive-artist" aria-labelledby={`archive-${artist.key}`}>
      <div className="archive-artist-head">
        <h2 id={`archive-${artist.key}`} lang={detectLineLanguage(name)}>
          {artistId ? (
            <Link className="linkish" to={`/artist/${artistId}`}>
              {name}
            </Link>
          ) : (
            name
          )}
        </h2>
        {artist.origin && <div className="archive-origin">{artist.origin}</div>}
        {count.length > 0 && <div className="archive-count">{count.join(' · ')}</div>}
      </div>
      <ul className="archive-rows">
        <li className="archive-row">
          <span className="archive-kind">Artist</span>
          <span className="archive-text">
            <span className="archive-preview" lang="ko">
              {artist.short}
            </span>
          </span>
          <span className="archive-actions">
            <ReadMore kind="ARTIST" note={artist} title={name} subtitle={artist.origin} />
          </span>
        </li>
        {albums.map((album) => {
          const title = album.titles[0]!;
          const albumId = album.albumIds[0];
          return (
            <li key={album.key} className="archive-row">
              <span className="archive-kind">{album.releaseYear ?? 'Album'}</span>
              <span className="archive-text">
                <b lang={detectLineLanguage(title)}>
                  {albumId ? (
                    <Link className="linkish" to={`/album/${albumId}`}>
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </b>
                <span className="archive-preview" lang="ko">
                  {album.short}
                </span>
              </span>
              <span className="archive-actions">
                <ReadMore kind="ALBUM" note={album} title={title} subtitle={[name, album.releaseYear].filter(Boolean).join(' · ')} />
              </span>
            </li>
          );
        })}
        {songs.map((song) => {
          const title = song.titles[0]!;
          return (
            <li key={song.key} className="archive-row">
              <span className="archive-kind">Song</span>
              <span className="archive-text">
                <b lang={detectLineLanguage(title)}>{title}</b>
                <span className="archive-preview" lang="ko">
                  {song.short}
                </span>
              </span>
              <span className="archive-actions">
                <ReadMore kind="SONG" note={song} title={title} subtitle={name} />
                <PlayTrack trackIds={song.trackIds} title={title} />
              </span>
            </li>
          );
        })}
        {translations.map((translation) => (
          <TranslationRow key={translation.key} translation={translation} />
        ))}
      </ul>
    </section>
  );
}

/**
 * The archive's own index, like the back of a book: every artist with a note,
 * their reviewed albums in release order, listening notes and curated
 * translations. Built from the local notes only.
 */
export function ArchivePage() {
  usePageTitle('Archive');
  const { entries, unattached } = buildArchiveIndex();
  const totals = [
    pluralise(entries.length, 'artist'),
    pluralise(albumNotes.length, 'album note'),
    pluralise(songNotes.length, 'listening note'),
    pluralise(curatedTranslations.length, 'translation'),
  ];

  return (
    <div className="view active">
      <div className="library-page archive-page">
        <div className="library-shell">
          <header className="library-head">
            <div className="artist-number">Personal music archive</div>
            <h1>Archive</h1>
            <p>{totals.join(' · ')}</p>
          </header>
          {entries.map((entry) => (
            <ArtistSection key={entry.artist.key} entry={entry} />
          ))}
          {unattached.length > 0 && (
            <section className="archive-artist" aria-labelledby="archive-other">
              <div className="archive-artist-head">
                <h2 id="archive-other">Other translations</h2>
              </div>
              <ul className="archive-rows">
                {unattached.map((translation) => (
                  <TranslationRow key={translation.key} translation={translation} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
