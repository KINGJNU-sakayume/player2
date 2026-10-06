import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../app/pageTitle';
import { CoverImage } from '../components/CoverImage';
import { useNote } from '../components/NoteContext';
import { songNotePayload } from '../components/SongNote';
import { albumNotes } from '../editorial/albums';
import { artistNotes } from '../editorial/artists';
import { songNotes } from '../editorial/songs';
import type { AlbumNote, ArtistNote, EditorialBody, SongNote } from '../editorial/types';
import { pluralise } from '../lib/format';
import { usePlay, usePlayerSelector } from '../playback/hooks';
import { detectLineLanguage } from '../translation/languageDetect';

interface ArtistEntry {
  artist: ArtistNote;
  albums: AlbumNote[];
  songs: SongNote[];
}

/** Every note in the archive, grouped under its artist. Pure data: no Spotify request. */
export function buildArchiveIndex(
  artists: readonly ArtistNote[] = artistNotes,
  albums: readonly AlbumNote[] = albumNotes,
  songs: readonly SongNote[] = songNotes,
): { entries: ArtistEntry[] } {
  const entries = [...artists]
    .sort((a, b) => a.names[0]!.localeCompare(b.names[0]!, 'en', { sensitivity: 'base' }))
    .map((artist) => ({
      artist,
      albums: albums.filter((a) => a.artist === artist.key).sort((a, b) => (a.releaseYear ?? 0) - (b.releaseYear ?? 0)),
      songs: songs.filter((s) => s.artist === artist.key).sort((a, b) => a.titles[0]!.localeCompare(b.titles[0]!)),
    }));
  return { entries };
}

function ReadMore({ kind, note, title, subtitle }: { kind: 'ARTIST' | 'ALBUM'; note: EditorialBody; title: string; subtitle?: string }) {
  const { openNote } = useNote();
  if (!note.full?.trim()) return null;
  const heading = 'Editorial note';
  const label = kind === 'ALBUM' ? 'Album' : 'Artist';
  return (
    <button
      type="button"
      className="row-play"
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

function ReadSong({ song, title, subtitle }: { song: SongNote; title: string; subtitle?: string }) {
  const { openNote } = useNote();
  if (!song.full?.trim() && !song.translation) return null;
  return (
    <button
      type="button"
      className="row-play"
      aria-label={`Read the note on ${title}`}
      onClick={() => openNote(songNotePayload(song, { title, subtitle, titleLang: detectLineLanguage(title) }))}
    >
      Read
    </button>
  );
}

/** One row per song: its Listening note (which carries the song's translation note, if any). */
function SongRow({ song, artistName }: { song: SongNote; artistName: string }) {
  const title = song.titles[0]!;
  return (
    <li className="archive-row">
      <span className="archive-kind">{song.translation ? 'Song · 번역' : 'Song'}</span>
      <span className="archive-text">
        <b lang={detectLineLanguage(title)}>{title}</b>
        {song.short && (
          <span className="archive-preview" lang="ko">
            {song.short}
          </span>
        )}
      </span>
      <span className="archive-actions">
        <ReadSong song={song} title={title} subtitle={artistName} />
        <PlayTrack trackIds={song.trackIds} title={title} />
      </span>
    </li>
  );
}

function entryCount({ albums, songs }: ArtistEntry): string {
  return [albums.length ? pluralise(albums.length, 'album note') : null, songs.length ? pluralise(songs.length, 'listening note') : null]
    .filter(Boolean)
    .join(' · ');
}

/** The chosen artist: the artist note, then album notes as cards and one row per Listening note. */
function ArtistSection({ entry }: { entry: ArtistEntry }) {
  const { artist, albums, songs } = entry;
  const name = artist.names[0]!;
  const artistId = artist.artistIds[0];
  return (
    <section className="archive-artist" aria-labelledby={`archive-${artist.key}`}>
      <div className="archive-artist-head">
        <div className="label">Editorial note / Artist</div>
        <h2 id={`archive-${artist.key}`} lang={detectLineLanguage(name)}>
          {name}
        </h2>
        {artist.origin && <div className="archive-origin">{artist.origin}</div>}
        {artist.short && (
          <p className="archive-short" lang="ko">
            {artist.short}
          </p>
        )}
        <div className="archive-head-actions">
          <ReadMore kind="ARTIST" note={artist} title={name} subtitle={artist.origin} />
          {artistId && (
            <Link className="row-play" to={`/artist/${artistId}`}>
              Artist page →
            </Link>
          )}
        </div>
      </div>

      {albums.length > 0 && (
        <div className="archive-group">
          <h3 className="archive-group-head">
            Album notes <span>{albums.length}</span>
          </h3>
          <ul className="archive-cards">
            {albums.map((album) => {
              const title = album.titles[0]!;
              const albumId = album.albumIds[0];
              return (
                <li key={album.key} className="archive-card">
                  <CoverImage images={[]} size={136} alt="" title={title} subtitle={name} paletteKey={albumId} className="archive-card-cover" />
                  <div className="archive-card-text">
                    <span className="archive-kind">{[album.releaseYear, 'Album'].filter(Boolean).join(' · ')}</span>
                    <b lang={detectLineLanguage(title)}>
                      {albumId ? (
                        <Link className="linkish" to={`/album/${albumId}`}>
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </b>
                    <span className="archive-card-preview" lang="ko">
                      {album.short}
                    </span>
                    <span className="archive-actions">
                      <ReadMore kind="ALBUM" note={album} title={title} subtitle={[name, album.releaseYear].filter(Boolean).join(' · ')} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {songs.length > 0 && (
        <div className="archive-group">
          <h3 className="archive-group-head">
            Listening notes <span>{songs.length}</span>
          </h3>
          <ul className="archive-rows">
            {songs.map((song) => (
              <SongRow key={song.key} song={song} artistName={name} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * The archive's own index, like the back of a book (v7.5): every artist with
 * a note on the left; the chosen artist's note, album notes and Listening
 * notes on the right. Notes open in the right-hand column. The chosen artist
 * lives in the address (`?artist=`). Built from the local notes only: no
 * Spotify request, so it works offline.
 */
export function ArchivePage() {
  usePageTitle('Archive');
  const { entries } = buildArchiveIndex();
  const [params, setParams] = useSearchParams();
  const track = usePlayerSelector((s) => s.snapshot.track);
  const playingArtist = track?.artists.map((a) => a.id).filter(Boolean) ?? [];
  const chosen =
    entries.find((e) => e.artist.key === params.get('artist')) ??
    entries.find((e) => e.artist.artistIds.some((id) => playingArtist.includes(id))) ??
    entries[0];
  const totals = [
    pluralise(entries.length, 'artist'),
    pluralise(albumNotes.length, 'album note'),
    pluralise(songNotes.length, 'listening note'),
  ];

  return (
    <div className="view active">
      <div className="library-page archive-page">
        <div className="library-shell">
          <header className="library-head">
            <div className="artist-number">Personal music archive</div>
            <h1>Archive</h1>
            <p>{totals.join(' · ')} · works offline</p>
          </header>
          <div className="archive-layout">
            <nav className="archive-index" aria-label="Artists with notes">
              <ul>
                {entries.map((entry) => {
                  const name = entry.artist.names[0]!;
                  const current = entry === chosen;
                  return (
                    <li key={entry.artist.key}>
                      <button
                        type="button"
                        className="archive-index-item"
                        aria-current={current ? 'true' : undefined}
                        onClick={() => setParams({ artist: entry.artist.key }, { replace: true })}
                      >
                        <b lang={detectLineLanguage(name)}>{name}</b>
                        {entry.artist.origin && <span>{entry.artist.origin}</span>}
                        <small>{entryCount(entry)}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {chosen && <ArtistSection key={chosen.artist.key} entry={chosen} />}
          </div>
        </div>
      </div>
    </div>
  );
}
