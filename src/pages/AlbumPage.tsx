import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useArchive } from '../app/ArchiveContext';
import { useAuth } from '../auth/AuthContext';
import { CoverImage } from '../components/CoverImage';
import { NotePreview } from '../components/NotePreview';
import { findSeedAlbum } from '../data/seed';
import type { AlbumWithTracks } from '../data/types';
import { getAlbumEditorial } from '../editorial/lookup';
import { usePlayback } from '../playback/PlaybackContext';
import { getSpotifyAlbum } from '../spotify/client';
import { formatTime, sumDuration } from '../utils/time';

export const AlbumPage = () => {
  const { albumId = '' } = useParams();
  const navigate = useNavigate();
  const archive = useArchive();
  const auth = useAuth();
  const playback = usePlayback();
  const seed = findSeedAlbum(albumId);
  const [album, setAlbum] = useState<AlbumWithTracks | undefined>(seed);
  const [loading, setLoading] = useState(!seed);
  const [error, setError] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  useEffect(() => {
    if (seed) {
      setAlbum(seed);
      setLoading(false);
      setError(undefined);
      return;
    }
    if (auth.status !== 'connected') {
      setLoading(false);
      setError('Connect Spotify to open albums outside the local ARC archive.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    getSpotifyAlbum(auth.getAccessToken, albumId)
      .then((value) => { if (!cancelled) setAlbum(value); })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load album.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [albumId, seed, auth.status, auth.getAccessToken]);

  if (loading) return <div className="view active"><div className="state-page"><div className="label">Album</div><h1>Loading album…</h1></div></div>;
  if (!album || error) return <div className="view active"><div className="state-page"><div className="label">Album</div><h1>Album unavailable</h1><p>{error}</p></div></div>;

  const artistName = album.artistNames[0] ?? 'Unknown artist';
  const artistId = album.artistIds[0] ?? '';
  const releaseYear = Number(album.releaseDate?.slice(0, 4)) || undefined;
  const note = getAlbumEditorial(artistName, album.name, releaseYear);
  const totalDuration = sumDuration(album.tracks.map((track) => track.durationMs));
  const activeTrackId = playback.snapshot?.track?.id ?? archive.selectedTrack.id;

  const onTrack = async (track: AlbumWithTracks['tracks'][number]) => {
    setFeedback(undefined);
    if (track.uri && auth.status === 'connected') {
      try {
        await playback.playTrack(track, album);
      } catch (cause) {
        setFeedback(cause instanceof Error ? cause.message : 'Unable to start playback.');
        return;
      }
    } else {
      archive.selectTrack(track);
    }
    navigate('/now-playing');
  };

  return (
    <div className="view active">
      <div className="album-page"><div className="album-shell">
        <section className="album-object">
          <div className="album-hero-cover"><CoverImage src={album.imageUrl} alt={`${album.name} album cover`} /></div>
          <div className="album-object-copy">
            <div className="label">Album</div>
            <h1>{album.name}</h1>
            {artistId ? <Link className="artist linkish" to={`/artist/${artistId}`}>{artistName}</Link> : <span className="artist">{artistName}</span>}
            <div className="album-hero-meta">
              <div><b>Release</b><span>{releaseYear ?? '—'}</span></div>
              <div><b>Format</b><span>{album.albumType ?? 'Album'}</span></div>
              <div><b>Tracks</b><span>{album.tracks.length}</span></div>
              <div><b>Duration</b><span>{formatTime(totalDuration)}</span></div>
            </div>
            <NotePreview kind="ALBUM" note={note} title={album.name} subtitle={`${artistName} · ${releaseYear ?? '—'} · ${album.tracks.length} tracks`} />
            {feedback && <div className="inline-feedback" role="status">{feedback}</div>}
          </div>
        </section>
        <section className="album-sequence">
          <div className="sequence-head"><h2>Track Sequence</h2><span>{album.tracks.length} tracks</span></div>
          <div className="track-table">
            {album.tracks.map((track) => (
              <button
                type="button"
                className={`track-item ${activeTrackId === track.id ? 'active' : ''}`}
                key={track.id}
                aria-current={activeTrackId === track.id ? 'true' : undefined}
                onClick={() => void onTrack(track)}
              >
                <span className="num">{String(track.trackNumber ?? 0).padStart(2, '0')}</span>
                <b>{track.title}</b>
                <span>{formatTime(track.durationMs)}</span>
              </button>
            ))}
          </div>
        </section>
      </div></div>
    </div>
  );
};
