import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AlbumIcon, ArtistIcon, MusicIcon, SettingsIcon } from '../components/icons';
import { NoteDrawer } from '../components/NoteDrawer';
import { SettingsPanel } from '../components/SettingsPanel';
import { findSeedAlbum, findSeedArtist } from '../data/seed';
import { usePlayback } from '../playback/PlaybackContext';
import { useArchive } from './ArchiveContext';

export const AppShell = () => {
  const location = useLocation();
  const auth = useAuth();
  const archive = useArchive();
  const playback = usePlayback();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const track = playback.snapshot?.track ?? archive.selectedTrack;
  const artistId = track.artists[0]?.id ?? archive.selectedArtistId;
  const albumId = track.album.id ?? archive.selectedAlbumId;
  const seedArtist = findSeedArtist(artistId);

  useEffect(() => {
    const accent = seedArtist?.accent ?? '#b91f2e';
    document.documentElement.style.setProperty('--main', accent);
  }, [seedArtist?.accent]);

  const crumbs = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/artist/')) {
      const id = path.split('/').pop() ?? '';
      return ['Player', 'Artist', findSeedArtist(id)?.name ?? (id === artistId ? track.artists[0]?.name : undefined) ?? 'Artist'];
    }
    if (path.startsWith('/album/')) {
      const id = path.split('/').pop() ?? '';
      return ['Player', findSeedAlbum(id)?.name ?? (id === albumId ? track.album.name : undefined) ?? 'Album'];
    }
    return ['Player', track.title];
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
          <NavLink to={`/artist/${artistId}`} title="Artist" aria-label="Artist"><ArtistIcon /></NavLink>
          <NavLink to={`/album/${albumId}`} title="Album" aria-label="Album"><AlbumIcon /></NavLink>
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
            {auth.hasClientId && auth.status !== 'connected' && auth.status !== 'connecting'
              ? <button type="button" onClick={() => void auth.connect()}>{topRight}</button>
              : <span>{topRight}</span>}
          </div>
        </header>
        <section className="stage"><Outlet /></section>
      </main>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NoteDrawer />
    </div>
  );
};
