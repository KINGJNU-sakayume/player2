import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArchive } from '../app/ArchiveContext';
import { useAuth } from '../auth/AuthContext';
import { useSpotifyEmbed } from '../playback/SpotifyEmbedContext';
import { searchSpotifyCatalog, type SpotifySearchResults } from '../spotify/client';

const emptyResults: SpotifySearchResults = { artists: [], albums: [], tracks: [] };

export const CatalogSearch = () => {
  const auth = useAuth();
  const archive = useArchive();
  const player = useSpotifyEmbed();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifySearchResults>(emptyResults);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (auth.status !== 'connected' || trimmed.length < 2) {
      setResults(emptyResults);
      setOpen(false);
      return;
    }
    const id = ++requestId.current;
    const timer = window.setTimeout(() => {
      searchSpotifyCatalog(auth.getAccessToken, trimmed)
        .then((value) => {
          if (id !== requestId.current) return;
          setResults(value);
          setError(undefined);
          setOpen(true);
        })
        .catch((cause: unknown) => {
          if (id !== requestId.current) return;
          setError(cause instanceof Error ? cause.message : 'Search failed.');
          setOpen(true);
        });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [query, auth.status, auth.getAccessToken]);

  const chooseTrack = (track: SpotifySearchResults['tracks'][number]) => {
    archive.selectTrack(track);
    if (track.uri) player.loadTrack(track.uri, true);
    setOpen(false);
    setQuery('');
    navigate('/now-playing');
  };

  return (
    <div className="catalog-search">
      <input
        type="search"
        value={query}
        placeholder={auth.status === 'connected' ? 'Search Spotify — artist, album, track' : 'Connect Spotify to search'}
        aria-label="Search Spotify catalog"
        disabled={auth.status !== 'connected'}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
      />
      {open && (
        <div className="search-results">
          {error && <div className="search-empty">{error}</div>}
          {!error && results.artists.length + results.albums.length + results.tracks.length === 0 && <div className="search-empty">No Spotify results.</div>}
          {results.tracks.length > 0 && <div className="search-group"><b>Tracks</b>{results.tracks.map((track) => <button key={track.id} type="button" onClick={() => chooseTrack(track)}><span>{track.title}</span><small>{track.artists.map((a) => a.name).join(', ')} · {track.album.name}</small></button>)}</div>}
          {results.artists.length > 0 && <div className="search-group"><b>Artists</b>{results.artists.map((artist) => <button key={artist.id} type="button" onClick={() => { setOpen(false); setQuery(''); navigate(`/artist/${artist.id}`); }}><span>{artist.name}</span><small>Artist</small></button>)}</div>}
          {results.albums.length > 0 && <div className="search-group"><b>Albums</b>{results.albums.map((album) => <button key={album.id} type="button" onClick={() => { setOpen(false); setQuery(''); navigate(`/album/${album.id}`); }}><span>{album.name}</span><small>{album.artistNames.join(', ')} · {album.releaseDate?.slice(0, 4) ?? ''}</small></button>)}</div>}
        </div>
      )}
    </div>
  );
};
