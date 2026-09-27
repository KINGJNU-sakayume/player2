import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useArchive } from '../app/ArchiveContext';
import { useAuth } from '../auth/AuthContext';
import { CoverImage } from '../components/CoverImage';
import { NextIcon, PlayIcon, PreviousIcon } from '../components/icons';
import { NotePreview } from '../components/NotePreview';
import type { AlbumWithTracks } from '../data/types';
import { getSongEditorial } from '../editorial/lookup';
import { LrclibLyricsProvider } from '../lyrics/LrclibLyricsProvider';
import { getLyricWindow } from '../lyrics/sync';
import type { TimedLyrics } from '../lyrics/types';
import { useSpotifyEmbed } from '../playback/SpotifyEmbedContext';
import { getSpotifyAlbum } from '../spotify/client';
import { formatTime, progressPercent } from '../utils/time';

const lyricProvider = new LrclibLyricsProvider();

export const NowPlayingPage = () => {
  const archive = useArchive();
  const auth = useAuth();
  const player = useSpotifyEmbed();
  const track = archive.selectedTrack;
  const [album, setAlbum] = useState<AlbumWithTracks>();
  const [lyrics, setLyrics] = useState<TimedLyrics | null>(null);
  const [lyricsState, setLyricsState] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'error'>('idle');

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
  }, [track?.album.id, auth.status, auth.getAccessToken]);

  useEffect(() => {
    if (!track) {
      setLyrics(null);
      setLyricsState('idle');
      return;
    }
    let cancelled = false;
    setLyricsState('loading');
    lyricProvider.getTimedLyrics(track)
      .then((value) => {
        if (cancelled) return;
        setLyrics(value);
        setLyricsState(value ? 'ready' : 'missing');
      })
      .catch(() => {
        if (cancelled) return;
        setLyrics(null);
        setLyricsState('error');
      });
    return () => { cancelled = true; };
  }, [track?.id]);

  useEffect(() => {
    if (!track || !player.playingUri || player.playingUri === track.uri || !album) return;
    const nextTrack = album.tracks.find((item) => item.uri === player.playingUri);
    if (nextTrack) archive.selectTrack(nextTrack);
  }, [player.playingUri, track, album, archive]);

  const positionMs = player.positionMs;
  const durationMs = player.durationMs || track?.durationMs || 0;
  const lyricWindow = useMemo(() => getLyricWindow(lyrics?.lines ?? [], positionMs), [lyrics, positionMs]);

  if (!track) {
    return <div className="view active"><div className="state-page"><div className="label">Now Playing</div><h1>Search Spotify to start listening.</h1><p>Use the search field above to open an artist, album, or track. Track playback is provided by the real Spotify Embed player, not a simulated browser device.</p></div></div>;
  }

  const artist = track.artists[0];
  const releaseYear = Number((album?.releaseDate ?? track.album.releaseDate)?.slice(0, 4)) || undefined;
  const trackNumber = album?.tracks.find((item) => item.id === track.id)?.trackNumber ?? track.trackNumber;
  const songNote = getSongEditorial(artist?.name ?? '', album?.name ?? track.album.name, track.title, releaseYear);
  const currentIndex = album?.tracks.findIndex((item) => item.id === track.id) ?? -1;

  const stepTrack = (offset: number) => {
    if (!album || currentIndex < 0) return;
    const next = album.tracks[currentIndex + offset];
    if (!next?.uri) return;
    archive.selectTrack(next);
    player.loadTrack(next.uri, true);
  };

  return (
    <div className="view active">
      <div className="player-page"><div className="player-shell">
        <section className="player-object">
          <div className="player-cover"><CoverImage src={album?.imageUrl ?? track.album.imageUrl} alt={`${track.album.name} album cover`} /></div>
          <div className="player-copy">
            <div className="label">Now playing · Spotify</div>
            <h1>{track.title}</h1>
            <div className="artist-line">
              {artist ? <Link className="linkish artist" to={`/artist/${artist.id}`}>{artist.name}</Link> : 'Unknown artist'}
              <span> · </span><Link className="linkish" to={`/album/${track.album.id}`}>{album?.name ?? track.album.name}</Link>
            </div>
            <div className="player-meta">
              <div><b>Track</b><span>{trackNumber ?? '—'}</span></div>
              <div><b>Release</b><span>{releaseYear ?? '—'}</span></div>
              <div><b>Duration</b><span>{formatTime(durationMs)}</span></div>
              <div><b>Lyrics</b><span>{lyrics?.source ?? lyricsState}</span></div>
            </div>
          </div>
        </section>

        <section className="player-listening">
          <div className="listening-head"><h2>Lyrics</h2><span>synced to Spotify playback</span></div>
          <div className="lyrics-panel" aria-live="polite">
            <div className="current-lyric">
              {lyricsState === 'loading' ? 'Loading synchronized lyrics…' : lyricWindow.current?.text ?? (lyricsState === 'missing' ? 'Synchronized lyrics unavailable' : lyricsState === 'error' ? 'Lyrics provider unavailable' : '—')}
            </div>
            <div className="next-lines">
              {lyricWindow.next && <div className="next-line">{lyricWindow.next.text}</div>}
              {lyricWindow.secondNext && <div className="next-line second">{lyricWindow.secondNext.text}</div>}
            </div>
          </div>

          <NotePreview kind="SONG" note={songNote} title={track.title} subtitle={`${artist?.name ?? 'Unknown artist'} · ${album?.name ?? track.album.name}`} className="player-note" />

          <div className="player-transport">
            <div className="controls">
              <button type="button" title="Previous" aria-label="Previous track" disabled={!album || currentIndex <= 0} onClick={() => stepTrack(-1)}><PreviousIcon /></button>
              <button type="button" className="play" title="Play / Pause" aria-label={player.paused ? 'Play' : 'Pause'} disabled={!player.ready} onClick={player.togglePlay}><PlayIcon paused={player.paused} /></button>
              <button type="button" title="Next" aria-label="Next track" disabled={!album || currentIndex < 0 || currentIndex >= album.tracks.length - 1} onClick={() => stepTrack(1)}><NextIcon /></button>
            </div>
            <div className="progress-wrap">
              <span>{formatTime(positionMs)}</span>
              <div className="progress-control">
                <div className="progress-visual" aria-hidden="true"><span style={{ width: `${progressPercent(positionMs, durationMs)}%` }} /></div>
                <input aria-label="Seek playback position" type="range" min={0} max={Math.max(1, durationMs)} step={1000} value={Math.min(positionMs, durationMs)} disabled={!player.ready} onChange={(event) => player.seek(Number(event.target.value))} />
              </div>
              <span>{formatTime(durationMs)}</span>
            </div>
          </div>
          <div className="playback-state" role="status">{player.error ?? (player.buffering ? 'Spotify buffering…' : player.ready ? 'Spotify Embed · live playback' : 'Loading Spotify player…')}</div>
        </section>
      </div></div>
    </div>
  );
};
