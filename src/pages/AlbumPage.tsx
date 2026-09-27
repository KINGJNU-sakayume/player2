import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useArchive } from '../app/ArchiveContext';
import { useAuth } from '../auth/AuthContext';
import { CoverImage } from '../components/CoverImage';
import { NotePreview } from '../components/NotePreview';
import type { AlbumWithTracks } from '../data/types';
import { getAlbumEditorial } from '../editorial/lookup';
import { useSpotifyEmbed } from '../playback/SpotifyEmbedContext';
import { getSpotifyAlbum } from '../spotify/client';
import { formatTime, sumDuration } from '../utils/time';

export const AlbumPage = () => {
  const { albumId = '' } = useParams();
  const navigate = useNavigate();
  const archive = useArchive();
  const auth = useAuth();
  const player = useSpotifyEmbed();
  const [album, setAlbum] = useState<AlbumWithTracks>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (auth.status !== 'connected') {
      setLoading(false);
      setError('Connect Spotify to load this album from the live catalog.');
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
  }, [albumId, auth.status, auth.getAccessToken]);

  if (loading) return <div className="view active"><div className="state-page"><div className="label">Album</div><h1>Loading Spotify album…</h1></div></div>;
  if (!album || error) return <div className="view active"><div className="state-page"><div className="label">Album</div><h1>Album unavailable</h1><p>{error}</p></div></div>;

  const artistName = album.artistNames[0] ?? 'Unknown artist';
  const artistId = album.artistIds[0] ?? '';
  const releaseYear = Number(album.releaseDate?.slice(0, 4)) || undefined;
  const note = getAlbumEditorial(artistName, album.name, releaseYear);
  const totalDuration = sumDuration(album.tracks.map((track) => track.durationMs));
  const activeTrackId = archive.selectedTrack?.id;

  const onTrack = (track: AlbumWithTracks['tracks'][number]) => {
    archive.selectTrack(track);
    if (track.uri) player.loadTrack(track.uri, true);
    navigate('/now-playing');
  };

  return (
    <div className="view active">
      <div className="album-page"><div className="album-shell">
        <section className="album-object">
          <div className="album-hero-cover"><CoverImage src={album.imageUrl} alt={`${album.name} album cover`} /></div>
          <div className="album-object-copy">
            <div className="label">Spotify album</div>
            <h1>{album.name}</h1>
            {artistId ? <Link className="artist linkish" to={`/artist/${artistId}`}>{artistName}</Link> : <span className="artist">{artistName}</span>}
            <div className="album-hero-meta">
              <div><b>Release</b><span>{releaseYear ?? '—'}</span></div>
              <div><b>Format</b><span>{album.albumType ?? 'Album'}</span></div>
              <div><b>Tracks</b><span>{album.tracks.length}</span></div>
              <div><b>Duration</b><span>{formatTime(totalDuration)}</span></div>
            </div>
            <NotePreview kind="ALBUM" note={note} title={album.name} subtitle={`${artistName} · ${releaseYear ?? '—'} · ${album.tracks.length} tracks`} />
          </div>
        </section>
        <section className="album-sequence">
          <div className="sequence-head"><h2>Track Sequence</h2><span>{album.tracks.length} tracks</span></div>
          <div className="track-table">
            {album.tracks.map((track) => (
              <button type="button" className={`track-item ${activeTrackId === track.id ? 'active' : ''}`} key={track.id} aria-current={activeTrackId === track.id ? 'true' : undefined} onClick={() => onTrack(track)}>
                <span className="num">{String(track.trackNumber ?? 0).padStart(2, '0')}</span><b>{track.title}</b><span>{formatTime(track.durationMs)}</span>
              </button>
            ))}
          </div>
        </section>
      </div></div>
    </div>
  );
};
