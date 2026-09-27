import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AlbumIcon, ArtistIcon, MusicIcon, SettingsIcon } from '../components/icons';
import { NoteDrawer } from '../components/NoteDrawer';
import { SettingsPanel } from '../components/SettingsPanel';
import { usePlayback } from '../playback/PlaybackContext';
import { SearchOverlay } from '../components/SearchOverlay';

export const AppShell = () => {
  const location = useLocation();
  const auth = useAuth();
  const playback = usePlayback();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const track = playback.snapshot?.track;
  const artistId = track?.artists[0]?.id;
  const albumId = track?.album.id;

  useEffect(() => {
    document.documentElement.style.setProperty('--main', '#b91f2e');
  }, [track?.id]);

  const crumbs = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/artist/')) {
      const id = path.split('/').pop() ?? '';
      return ['Player', 'Artist', (id === artistId ? track?.artists[0]?.name : undefined) ?? 'Artist'];
    }
    if (path.startsWith('/album/')) {
      const id = path.split('/').pop() ?? '';
      return ['Player', (id === albumId ? track?.album.name : undefined) ?? 'Album'];
    }
    return ['Player', track?.title ?? 'Now Playing'];
  }, [location.pathname, artistId, albumId, track]);

  const topRight = !auth.hasClientId
    ? 'Demo archive'
    : auth.status === 'connected'
      ? playback.status === 'ready' ? 'Spotify · browser ready' : `Spotify · ${playback.status}`
      : auth.status === 'connecting' ? 'Spotify · connecting' : 'Connect Spotify';

  return (
    <div className="app">
      <aside className="rail" aria-label="Primary navigation">
        <NavLink className="logo" to="/now-playing" aria-label="ARC Music — Now Playing"><b>ARC</b><span>music</span></NavLink>
        <nav>
          <NavLink to="/now-playing" title="Now Playing" aria-label="Now Playing"><MusicIcon /></NavLink>
          {artistId && <NavLink to={`/artist/${artistId}`} title="Artist" aria-label="Artist"><ArtistIcon /></NavLink>}
          {albumId && <NavLink to={`/album/${albumId}`} title="Album" aria-label="Album"><AlbumIcon /></NavLink>}
        </nav>
        <div className="rail-foot">
          <button type="button" title="Settings" aria-label="Settings" onClick={() => setSettingsOpen((value) => !value)}><SettingsIcon /></button>
          <div className="user" aria-label="Personal archive">WJ</div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((crumb, index) => <span key={`${crumb}-${index}`}>{index > 0 && <i>/</i>}{crumb}</span>)}
          </div>
          <div className="top-mark"><b>Personal Music Archive</b></div>
          <div className="top-right">
            <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)}>Search</button>
            {auth.hasClientId && auth.status !== 'connected' && auth.status !== 'connecting'
              ? <button type="button" onClick={() => void auth.connect()}>{topRight}</button>
              : <span>{topRight}</span>}
          </div>
        </header>
        <section className="stage"><Outlet /></section>
      </main>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NoteDrawer />
    </div>
  );
};
