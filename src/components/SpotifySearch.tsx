import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { ArtistIdentity, ArtistRelease } from '../data/types';
import { searchSpotify, type SpotifySearchResults } from '../spotify/client';

const emptyResults: SpotifySearchResults = { artists: [], albums: [] };

export const SpotifySearch = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifySearchResults>(emptyResults);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  useEffect(() => {
    const value = query.trim();
    if (auth.status !== 'connected' || value.length < 2) {
      setResults(emptyResults);
      setLoading(false);
      setError(undefined);
      return;
    }

    const id = requestId.current + 1;
    requestId.current = id;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      searchSpotify(auth.getAccessToken, value)
        .then((next) => {
          if (requestId.current !== id) return;
          setResults(next);
          setOpen(true);
        })
        .catch((cause: unknown) => {
          if (requestId.current !== id) return;
          setResults(emptyResults);
          setError(cause instanceof Error ? cause.message : 'Spotify search failed.');
          setOpen(true);
        })
        .finally(() => {
          if (requestId.current === id) setLoading(false);
        });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [auth.getAccessToken, auth.status, query]);

  const chooseArtist = (artist: ArtistIdentity) => {
    setOpen(false);
    setQuery('');
    navigate(`/artist/${artist.id}`);
  };

  const chooseAlbum = (album: ArtistRelease) => {
    setOpen(false);
    setQuery('');
    navigate(`/album/${album.id}`);
  };

  const hasResults = results.artists.length > 0 || results.albums.length > 0;

  return (
    <div className="spotify-search">
      <input
        type="search"
        value={query}
        disabled={auth.status !== 'connected'}
        placeholder={auth.status === 'connected' ? 'Search artists or albums' : 'Connect Spotify to search'}
        aria-label="Search Spotify artists and albums"
        onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(event.target.value.trim().length >= 2);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
      />
      {loading && <span className="search-status">Searching…</span>}
      {open && query.trim().length >= 2 && (
        <div className="search-popover" role="listbox" aria-label="Spotify search results">
          {error && <div className="search-message">{error}</div>}
          {!error && !loading && !hasResults && <div className="search-message">No matching artists or albums.</div>}
          {results.artists.length > 0 && (
            <section>
              <div className="search-section-label">Artists</div>
              {results.artists.map((artist) => (
                <button type="button" className="search-result" key={artist.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseArtist(artist)}>
                  <span className="search-thumb search-artist-thumb">
                    {artist.imageUrl ? <img src={artist.imageUrl} alt="" /> : <span>{artist.name.slice(0, 1)}</span>}
                  </span>
                  <span className="search-copy"><b>{artist.name}</b><small>{artist.genres?.slice(0, 2).join(' · ') || 'Artist'}</small></span>
                </button>
              ))}
            </section>
          )}
          {results.albums.length > 0 && (
            <section>
              <div className="search-section-label">Albums</div>
              {results.albums.map((album) => (
                <button type="button" className="search-result" key={album.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseAlbum(album)}>
                  <span className="search-thumb">
                    {album.imageUrl ? <img src={album.imageUrl} alt="" /> : <span>ARC</span>}
                  </span>
                  <span className="search-copy">
                    <b>{album.name}</b>
                    <small>{album.artistNames.join(', ')} · {album.releaseDate?.slice(0, 4) ?? '—'}</small>
                  </span>
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
