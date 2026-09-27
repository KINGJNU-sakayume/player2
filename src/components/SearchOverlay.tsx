import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePlayback } from '../playback/PlaybackContext';
import { searchSpotify, type SearchResults } from '../spotify/client';

const empty: SearchResults = { tracks: [], artists: [], albums: [] };

export const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const auth = useAuth();
  const playback = usePlayback();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(empty);
  const [status, setStatus] = useState('Search Spotify for tracks, artists, and albums.');

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || query.trim().length < 2 || auth.status !== 'connected') { setResults(empty); return; }
    const controller = new AbortController();
    setStatus('Searching Spotify…');
    const timer = window.setTimeout(() => {
      searchSpotify(auth.getAccessToken, query.trim())
        .then((value) => { if (!controller.signal.aborted) { setResults(value); setStatus(value.tracks.length + value.artists.length + value.albums.length ? '' : 'No Spotify results.'); } })
        .catch((cause: unknown) => { if (!controller.signal.aborted) setStatus(cause instanceof Error ? cause.message : 'Search failed.'); });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query, auth.status, auth.getAccessToken]);

  if (!open) return null;
  const go = (path: string) => { onClose(); navigate(path); };
  return <div className="search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Spotify">
      <header><span>Spotify search</span><button type="button" onClick={onClose} aria-label="Close search">×</button></header>
      <input ref={input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Track, artist, or album" aria-label="Search Spotify" />
      {auth.status !== 'connected' ? <p className="search-status">Connect Spotify to search its catalogue.</p> : status && <p className="search-status" role="status">{status}</p>}
      <div className="search-results">
        {results.tracks.map((track) => <button key={`t-${track.id}`} type="button" onClick={async () => { try { await playback.playTrack(track, track.album); go('/now-playing'); } catch (cause) { setStatus(cause instanceof Error ? cause.message : 'Playback failed.'); } }}><b>{track.title}</b><span>Track · {track.artists.map((a) => a.name).join(', ')}</span></button>)}
        {results.artists.map((artist) => <button key={`r-${artist.id}`} type="button" onClick={() => go(`/artist/${artist.id}`)}><b>{artist.name}</b><span>Artist</span></button>)}
        {results.albums.map((album) => <button key={`a-${album.id}`} type="button" onClick={() => go(`/album/${album.id}`)}><b>{album.name}</b><span>Album · {album.artistNames.join(', ')}</span></button>)}
      </div>
    </section>
  </div>;
};
