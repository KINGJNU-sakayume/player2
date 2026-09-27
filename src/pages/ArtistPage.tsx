import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { NotePreview } from '../components/NotePreview';
import type { ArtistIdentity, ArtistRelease } from '../data/types';
import { getArtistEditorial } from '../editorial/lookup';
import { getSpotifyArtist, getSpotifyArtistReleases } from '../spotify/client';

export const ArtistPage = () => {
  const { artistId = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [artist, setArtist] = useState<ArtistIdentity>();
  const [releases, setReleases] = useState<ArtistRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (auth.status !== 'connected') {
      setLoading(false);
      setError('Connect Spotify to load this artist from the live catalog.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    Promise.all([getSpotifyArtist(auth.getAccessToken, artistId), getSpotifyArtistReleases(auth.getAccessToken, artistId)])
      .then(([artistValue, releaseValues]) => {
        if (cancelled) return;
        setArtist(artistValue);
        setReleases(releaseValues);
      })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load artist.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [artistId, auth.status, auth.getAccessToken]);

  const note = artist ? getArtistEditorial(artist.name) : undefined;
  const subtitle = artist?.genres?.slice(0, 4).join(' · ') || 'Spotify artist';
  const monogram = useMemo(() => artist?.name.trim().slice(0, 1).toUpperCase() ?? 'A', [artist?.name]);

  if (loading) return <div className="view active"><div className="state-page"><div className="label">Artist profile</div><h1>Loading Spotify artist…</h1></div></div>;
  if (!artist || error) return <div className="view active"><div className="state-page"><div className="label">Artist profile</div><h1>Artist unavailable</h1><p>{error}</p></div></div>;

  return (
    <div className="view active">
      <div className="artist-page"><div className="artist-shell">
        <section className="artist-hero">
          <div className={`artist-portrait ${artist.imageUrl ? 'has-image' : ''}`} data-monogram={monogram}>
            {artist.imageUrl && <img src={artist.imageUrl} alt={`${artist.name} artist portrait`} />}
          </div>
          <div className="artist-copy">
            <div className="artist-number">Spotify artist</div>
            <h1>{artist.name}</h1>
            <div className="origin">{subtitle}</div>
            <NotePreview kind="ARTIST" note={note} title={artist.name} subtitle={subtitle} />
          </div>
        </section>
        <section className="artist-grid"><div className="artist-section">
          <h3>Releases</h3>
          {releases.map((release) => (
            <article className="release-card" key={release.id}>
              {release.imageUrl ? <img src={release.imageUrl} alt={`${release.name} album cover`} /> : <div className="release-cover-fallback">ARC</div>}
              <div><div className="label">{release.releaseDate?.slice(0, 4) ?? '—'} / {release.albumType ?? 'Release'}</div><h4>{release.name}</h4><div className="release-meta"><span>{release.totalTracks ?? '—'} tracks</span></div></div>
              <button type="button" onClick={() => navigate(`/album/${release.id}`)}>Open album</button>
            </article>
          ))}
        </div></section>
      </div></div>
    </div>
  );
};
