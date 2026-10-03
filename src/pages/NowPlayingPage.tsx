import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../app/pageTitle';
import { useSession } from '../app/sessionContext';
import { useAlbum } from '../catalogue/queries';
import { ArtistLinks } from '../components/ArtistLinks';
import { CoverImage } from '../components/CoverImage';
import { LyricsBlock, languageName } from '../components/player/LyricsBlock';
import { NoteColumn } from '../components/player/NoteColumn';
import { PlaybackNotice } from '../components/player/PlaybackNotice';
import { Transport } from '../components/player/Transport';
import { TransportExtras } from '../components/player/TransportExtras';
import { SongNotePreview, songNotePayload } from '../components/SongNote';
import { StateView } from '../components/StateView';
import { getSongNote } from '../editorial/lookup';
import { formatDuration, formatTrackNumber, joinArtistNames, releaseYear } from '../lib/format';
import { useTimedLyrics } from '../lyrics/useTimedLyrics';
import { useEngine, usePlayerSelector, usePlayerSnapshot } from '../playback/hooks';
import { detectLineLanguage } from '../translation/languageDetect';

/** Latin script says nothing about a song's language ("Lemon" is Japanese); only CJK titles are a hint. */
function titleLanguage(title: string): string | undefined {
  const language = detectLineLanguage(title);
  return language === 'en' ? undefined : language;
}

/**
 * The one Now Playing design (v7): the album object on the left — cover,
 * title, artist · album, track / release / duration / language — and the
 * listening column on the right — lyrics, Listening Note and the transport.
 * The full Listening note opens in the page as a column on the right; the
 * lyrics then take the whole width left of it and the album drops to the
 * bottom-left corner.
 *
 * Both sides share one grid's rows (base.css, `.player-shell`), so their lines
 * meet: the cover starts on the Lyrics rule, the Now playing block is as tall as
 * the Listening note, and the Track / Release rule continues the transport's.
 */
export function NowPlayingPage() {
  const snapshot = usePlayerSnapshot();
  const hydrated = usePlayerSelector((s) => s.hydrated);
  const track = snapshot.track;
  const album = useAlbum(track?.album.id || undefined);
  const lyricsState = useTimedLyrics(track);
  usePageTitle('Now Playing', track?.title ?? null);
  const [noteOpen, setNoteOpen] = useState(false);
  // A new track closes the previous track's note.
  const trackId = track?.spotifyTrackId;
  useEffect(() => setNoteOpen(false), [trackId]);

  if (!hydrated) return <NowPlayingLoading />;
  if (!track) return <NothingPlaying />;

  const detail = album.data;
  const albumName = detail?.name ?? track.album.name;
  const durationMs = snapshot.durationMs || track.durationMs;
  const albumTrack = detail?.tracks.find((item) => item.id === track.spotifyTrackId || item.uri === track.uri);
  const trackCount = detail?.totalTracks ?? (detail ? detail.tracks.length : null);
  const year = releaseYear(detail?.releaseDate ?? null);
  const lyricLanguage = lyricsState.status === 'ready' ? lyricsState.lyrics.language : undefined;
  const language = languageName(lyricLanguage ?? titleLanguage(track.title));
  const songNote = getSongNote({ id: track.spotifyTrackId, title: track.title, artistNames: track.artists.map((a) => a.name) });
  const titleLang = lyricLanguage ?? detectLineLanguage(track.title);
  const artistNames = joinArtistNames(track.artists) || 'Unknown artist';
  const noteContext = {
    title: track.title,
    titleLang,
    subtitle: `${artistNames} · ${albumName}${albumTrack ? ` · Track ${formatTrackNumber(albumTrack.trackNumber)}` : ''}`,
  };
  const showNote = noteOpen && songNote !== null;

  return (
    <div className="view active">
      <div className={showNote ? 'player-page note-open' : 'player-page'}>
        <div className="player-stage">
          <div className="player-shell">
            <section className="player-object" aria-label="Now playing">
              <div className="player-cover">
                <CoverImage
                  images={track.album.images}
                  size={520}
                  alt={`${albumName} album cover`}
                  title={albumName}
                  subtitle={artistNames}
                  paletteKey={track.album.id}
                  shadow
                  priority
                />
              </div>
              <div className="player-copy">
                <div className="label">Now playing</div>
                <h1 lang={titleLang}>{track.title}</h1>
                <div className="artist-line">
                  <ArtistLinks artists={track.artists} />
                  {track.album.id && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <Link className="linkish" to={`/album/${track.album.id}`} lang={detectLineLanguage(albumName)}>
                        {albumName}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="player-meta">
                <div>
                  <b>Track</b>
                  <span>
                    {albumTrack ? `${formatTrackNumber(albumTrack.trackNumber)} / ${trackCount ? formatTrackNumber(trackCount) : '—'}` : '—'}
                  </span>
                </div>
                <div>
                  <b>Release</b>
                  <span>{year ?? '—'}</span>
                </div>
                <div>
                  <b>Duration</b>
                  <span>{formatDuration(durationMs)}</span>
                </div>
                <div>
                  <b>Language</b>
                  <span>{language ?? '—'}</span>
                </div>
              </div>
            </section>

            <section className="player-listening" aria-label="Lyrics and playback controls">
              <LyricsBlock
                key={track.spotifyTrackId}
                track={track}
                lyricsState={lyricsState}
                context={`${albumName} / ${trackCount ?? '—'} tracks`}
              />

              <SongNotePreview note={songNote} {...noteContext} className="player-note" onOpen={() => setNoteOpen(true)} expanded={showNote} />

              <div className="player-controls">
                <Transport />
                <TransportExtras />
                <PlaybackNotice />
              </div>
            </section>
          </div>
          {showNote && <NoteColumn note={songNotePayload(songNote, noteContext)} onClose={() => setNoteOpen(false)} />}
        </div>
      </div>
    </div>
  );
}

function NowPlayingLoading() {
  const { mode } = useSession();
  return (
    <StateView label="Now playing" title={mode === 'preview' ? 'Opening the preview…' : 'Reading playback…'}>
      <p>{mode === 'preview' ? 'Loading the sample archive.' : 'ARC is reading the current playback state from Spotify.'}</p>
    </StateView>
  );
}

function NothingPlaying() {
  const sdk = usePlayerSelector((s) => s.sdk);
  const engine = useEngine();

  let title = 'No active track';
  let body = 'Start a track from your library, Search or another Spotify device. ARC follows the real playback session.';
  if (sdk.kind === 'loading') {
    title = 'Starting browser playback…';
    body = 'Connecting this browser to Spotify as the ARC Music Browser device. Music started on another device will appear here.';
  } else if (sdk.kind === 'error') {
    title = 'Browser playback unavailable';
    body = `${sdk.message} Start music on another Spotify device and it will appear here.`;
  }

  return (
    <StateView
      label="Now playing"
      title={title}
      actions={
        <>
          <Link className="plain-action" to="/library">
            Browse your library
          </Link>
          {sdk.kind === 'ready' && (
            <button
              type="button"
              className="plain-action"
              onClick={() => {
                engine.activateAudio();
                void engine.transferToBrowser(true);
              }}
            >
              Resume in this browser
            </button>
          )}
          <button type="button" className="plain-action" onClick={() => void engine.resync()}>
            Check again
          </button>
        </>
      }
    >
      <p>{body}</p>
      <PlaybackNotice />
    </StateView>
  );
}
