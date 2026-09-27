import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useArchive } from './ArchiveContext';
import { useAuth } from '../auth/AuthContext';
import { AlbumIcon, ArtistIcon, MusicIcon, SettingsIcon } from '../components/icons';
import { CatalogSearch } from '../components/CatalogSearch';
import { NoteDrawer } from '../components/NoteDrawer';
import { SettingsPanel } from '../components/SettingsPanel';

export const AppShell = () => {
  const location = useLocation();
  const auth = useAuth();
  const archive = useArchive();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const track = archive.selectedTrack;
  const artistId = track?.artists[0]?.id;
  const albumId = track?.album.id;

  const crumbs = useMemo(() => {
    if (location.pathname.startsWith('/artist/')) return ['Player', 'Artist'];
    if (location.pathname.startsWith('/album/')) return ['Player', 'Album'];
    return ['Player', track?.title ?? 'Now Playing'];
  }, [location.pathname, track?.title]);

  return (
    <div className="app">
      <aside className="rail" aria-label="Primary navigation">
        <NavLink className="logo" to="/now-playing" aria-label="ARC Music — Now Playing"><b>ARC</b><span>music</span></NavLink>
        <nav>
          <NavLink to="/now-playing" title="Now Playing" aria-label="Now Playing"><MusicIcon /></NavLink>
          {artistId && <NavLink to={`/artist/${artistId}`} title="Current artist" aria-label="Current artist"><ArtistIcon /></NavLink>}
          {albumId && <NavLink to={`/album/${albumId}`} title="Current album" aria-label="Current album"><AlbumIcon /></NavLink>}
        </nav>
        <div className="rail-foot">
          <button type="button" title="Settings" aria-label="Settings" onClick={() => setSettingsOpen((value) => !value)}><SettingsIcon /></button>
          <div className="user" aria-label="Personal archive">WJ</div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="crumbs" aria-label="Breadcrumb">{crumbs.map((crumb, index) => <span key={crumb}>{index > 0 && <i>/</i>}{crumb}</span>)}</div>
          <CatalogSearch />
          <div className="top-right">
            {auth.hasClientId && auth.status !== 'connected' && auth.status !== 'connecting'
              ? <button type="button" onClick={() => void auth.connect()}>Connect Spotify</button>
              : <span>{auth.status === 'connected' ? 'Spotify catalog connected' : auth.status}</span>}
          </div>
        </header>
        <section className="stage"><Outlet /></section>
      </main>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NoteDrawer />
    </div>
  );
};
