import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoverImage } from '../components/CoverImage';
import { NextIcon, PlayIcon, PreviousIcon } from '../components/icons';
import { NotePreview } from '../components/NotePreview';
import type { AlbumWithTracks } from '../data/types';
import { getSongEditorial } from '../editorial/lookup';
import { LrclibLyricsProvider } from '../lyrics/LrclibLyricsProvider';
import { getLyricWindow } from '../lyrics/sync';
import type { TimedLyrics } from '../lyrics/types';
import { usePlayback } from '../playback/PlaybackContext';
import { useInterpolatedPosition } from '../playback/useInterpolatedPosition';
import { useAuth } from '../auth/AuthContext';
import { getSpotifyAlbum } from '../spotify/client';
import { formatTime, progressPercent } from '../utils/time';

const lyricProvider = new LrclibLyricsProvider();

export const NowPlayingPage = () => {
  const auth = useAuth();
  const playback = usePlayback();
  const snapshot = playback.snapshot;
  const track = snapshot?.track;
  const [album, setAlbum] = useState<AlbumWithTracks>();
  const [lyrics, setLyrics] = useState<TimedLyrics | null>(null);
  const [lyricsStatus, setLyricsStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [feedback, setFeedback] = useState<string>();
  const positionMs = useInterpolatedPosition(snapshot);

  useEffect(() => {
    if (!track || auth.status !== 'connected') {
      setAlbum(undefined);
      return;
    }
    let cancelled = false;
    getSpotifyAlbum(auth.getAccessToken, track.album.id)
      .then((value) => { if (!cancelled) setAlbum(value); })
      .catch(() => { if (!cancelled) setAlbum(undefined); });
    return () => { cancelled = true; };
  }, [track, auth.status, auth.getAccessToken]);

  useEffect(() => {
    if (!track) { setLyrics(null); return; }
    const controller = new AbortController();
    setLyricsStatus('loading');
    lyricProvider.getTimedLyrics({ ...track, language: album?.language ?? track.language }, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setLyrics(value);
        setLyricsStatus(value ? 'ready' : 'missing');
      })
      .catch((cause: unknown) => { if (!controller.signal.aborted && !(cause instanceof DOMException && cause.name === 'AbortError')) { setLyrics(null); setLyricsStatus('error'); } });
    return () => controller.abort();
  // The provider needs the full track object, but lyrics should only refetch when track identity/content changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id, track?.durationMs, track?.language, track?.title, album?.language]);

  const lyricWindow = useMemo(() => getLyricWindow(lyrics?.lines ?? [], positionMs), [lyrics, positionMs]);
  if (!track) return <div className="view active"><div className="state-page"><div className="label">Now playing</div><h1>{auth.status === 'connected' ? 'No active track' : 'Connect Spotify'}</h1><p>{auth.status === 'connected' ? 'Start a track from Spotify Search or another Spotify device. ARC will follow the real playback session.' : 'Connect a Spotify Premium account to initialize the browser player and search the Spotify catalogue.'}</p>{auth.status !== 'connected' && auth.hasClientId && <button className="plain-action" type="button" onClick={() => void auth.connect()}>Connect Spotify</button>}</div></div>;

  const durationMs = snapshot?.durationMs || track.durationMs;
  const artist = track.artists[0];
  const releaseYear = Number((album?.releaseDate ?? track.album.releaseDate)?.slice(0, 4)) || undefined;
  const trackNumber = album?.tracks.find((item) => item.id === track.id)?.trackNumber ?? track.trackNumber;
  const songNote = getSongEditorial(artist?.name ?? '', album?.name ?? track.album.name, track.title, releaseYear);
  const controlsEnabled = auth.status === 'connected' && playback.status === 'ready' && Boolean(snapshot);

  const runControl = async (action: () => Promise<void>) => {
    setFeedback(undefined);
    try {
      await action();
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : 'Playback command failed.');
    }
  };

  const contextText = snapshot
    ? 'Spotify Web Playback SDK'
    : auth.status === 'connected'
      ? 'No active Spotify playback · showing archive selection'
      : 'Archive preview · connect Spotify for live playback';

  return (
    <div className="view active">
      <div className="player-page">
        <div className="player-shell">
          <section className="player-object">
            <div className="player-cover"><CoverImage src={album?.imageUrl ?? track.album.imageUrl} alt={`${track.album.name} album cover`} /></div>
            <div className="player-copy">
              <div className="label">Now playing</div>
              <h1 lang={album?.lang}>{track.title}</h1>
              <div className="artist-line">
                {artist ? <Link className="linkish artist" to={`/artist/${artist.id}`}>{artist.name}</Link> : 'Unknown artist'}
                <span> · </span>
                <Link className="linkish" to={`/album/${track.album.id}`}>{album?.name ?? track.album.name}</Link>
              </div>
              <div className="player-meta">
                <div><b>Track</b><span>{trackNumber ? `${String(trackNumber).padStart(2, '0')} / ${String(album?.totalTracks ?? album?.tracks.length ?? '—').padStart(2, '0')}` : '—'}</span></div>
                <div><b>Release</b><span>{releaseYear ?? '—'}</span></div>
                <div><b>Duration</b><span>{formatTime(durationMs)}</span></div>
                <div><b>Language</b><span>{album?.language ?? track.language ?? '—'}</span></div>
              </div>
            </div>
          </section>

          <section className="player-listening">
            <div className="listening-head"><h2>Lyrics</h2><span>{album?.name ?? track.album.name} / {album?.totalTracks ?? album?.tracks.length ?? '—'} tracks</span></div>
            <div className="lyrics-panel" aria-live="polite">
              <div className="current-lyric" lang={album?.lang}>{lyricWindow.current?.text ?? (lyricsStatus === 'loading' ? 'Loading synchronized lyrics…' : lyricsStatus === 'error' ? 'Lyrics provider unavailable' : 'Synchronized lyrics unavailable')}</div>
              <div className="next-lines">
                {lyricWindow.next && <div className="next-line">{lyricWindow.next.text}</div>}
                {lyricWindow.secondNext && <div className="next-line second">{lyricWindow.secondNext.text}</div>}
              </div>
            </div>

            <NotePreview
              kind="SONG"
              note={songNote}
              title={track.title}
              subtitle={`${artist?.name ?? 'Unknown artist'} · ${album?.name ?? track.album.name}${trackNumber ? ` · Track ${String(trackNumber).padStart(2, '0')}` : ''}`}
              className="player-note"
            />

            <div className="player-transport">
              <div className="controls">
                <button type="button" title="Previous" aria-label="Previous track" disabled={!controlsEnabled} onClick={() => void runControl(playback.previous)}><PreviousIcon /></button>
                <button type="button" className="play" title="Play / Pause" aria-label={snapshot?.paused ? 'Play' : 'Pause'} disabled={!controlsEnabled} onClick={() => void runControl(playback.togglePlay)}><PlayIcon paused={snapshot?.paused ?? true} /></button>
                <button type="button" title="Next" aria-label="Next track" disabled={!controlsEnabled} onClick={() => void runControl(playback.next)}><NextIcon /></button>
              </div>
              <div className="progress-wrap">
                <span>{formatTime(positionMs)}</span>
                <div className="progress-control">
                  <div className="progress-visual" aria-hidden="true"><span style={{ width: `${progressPercent(positionMs, durationMs)}%` }} /></div>
                  <input
                    aria-label="Seek playback position"
                    type="range"
                    min={0}
                    max={Math.max(1, durationMs)}
                    step={1000}
                    value={Math.min(positionMs, durationMs)}
                    disabled={!controlsEnabled}
                    onChange={(event) => void runControl(() => playback.seek(Number(event.target.value)))}
                  />
                </div>
                <span>{formatTime(durationMs)}</span>
              </div>
            </div>
            <div className="playback-state" role="status">{feedback ?? playback.error ?? contextText}</div>
          </section>
        </div>
      </div>
    </div>
  );
};
