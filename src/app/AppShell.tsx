import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProfile } from '../catalogue/queries';
import { AlbumIcon, ArtistIcon, LibraryIcon, MusicIcon, QueueIcon, SearchIcon, SettingsIcon } from '../components/icons';
import { NoteProvider } from '../components/NoteContext';
import { NoteDrawer } from '../components/NoteDrawer';
import { QueueDrawer } from '../components/QueueDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { SettingsPanel } from '../components/SettingsPanel';
import { usePlayerSelector } from '../playback/hooks';
import { AccentTokens } from './AccentTokens';
import { useAppServices, useAuthState } from './appContext';
import { GlobalShortcuts } from './GlobalShortcuts';
import { useCurrentPageTitle } from './pageTitle';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { useSessionControls } from './sessionControls';
import { useSession } from './sessionContext';
import { ShellContext, useShell, type ShellControls } from './shellContext';

function initials(name: string | null | undefined): string {
  if (!name) return 'ARC';
  const parts = name.split(/[\s,._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => Array.from(part)[0]!.toUpperCase()).join('') || 'ARC';
}

function Rail() {
  const track = usePlayerSelector((s) => s.snapshot.track);
  const shell = useShell();
  const profile = useProfile();
  const artistId = track?.artists[0]?.id;
  const albumId = track?.album.id;
  const name = profile.data?.displayName ?? null;

  return (
    <aside className="rail" aria-label="Primary navigation">
      <Link className="logo" to="/now-playing" aria-label="ARC Music — Now Playing">
        <b>ARC</b>
        <span>music</span>
      </Link>
      <nav>
        <NavLink to="/now-playing" title="Now Playing" aria-label="Now Playing">
          <MusicIcon />
        </NavLink>
        <NavLink to="/library" title="Library" aria-label="Library">
          <LibraryIcon />
        </NavLink>
        <button type="button" title="Search (/)" aria-label="Search" aria-keyshortcuts="/" onClick={shell.openSearch}>
          <SearchIcon />
        </button>
        {artistId && (
          <NavLink to={`/artist/${artistId}`} title="Artist" aria-label="Current artist">
            <ArtistIcon />
          </NavLink>
        )}
        {albumId && (
          <NavLink to={`/album/${albumId}`} title="Album" aria-label="Current album">
            <AlbumIcon />
          </NavLink>
        )}
      </nav>
      <div className="rail-foot">
        <button type="button" title="Queue" aria-label="Queue" aria-haspopup="dialog" onClick={shell.openQueue}>
          <QueueIcon />
        </button>
        <button type="button" title="Settings" aria-label="Settings" onClick={shell.toggleSettings}>
          <SettingsIcon />
        </button>
        <div className="user" role="img" title={name ?? 'Personal archive'} aria-label={name ? `Signed in as ${name}` : 'Personal archive'}>
          {initials(name)}
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { section, title } = useCurrentPageTitle();
  const { pathname } = useLocation();
  const { mode } = useSession();
  const { auth } = useAppServices();
  const controls = useSessionControls();
  const shell = useShell();
  const track = usePlayerSelector((s) => s.snapshot.track);
  const sdk = usePlayerSelector((s) => s.sdk);

  const status =
    mode === 'preview'
      ? 'Preview · no audio'
      : sdk.kind === 'ready'
        ? 'Spotify · browser ready'
        : sdk.kind === 'loading'
          ? 'Spotify · connecting'
          : sdk.kind === 'reconnecting'
            ? 'Spotify · reconnecting'
            : 'Spotify';

  return (
    <header className="topbar">
      <div className="crumbs" aria-label="Breadcrumb">
        <span>Player</span>
        {section !== 'Now Playing' && (
          <span>
            <i>/</i>
            {section}
          </span>
        )}
        {title && (
          <span className="crumb-title">
            <i>/</i>
            {title}
          </span>
        )}
      </div>
      <div className="top-mark">
        <b>Personal Music Archive</b>
      </div>
      <div className="top-right">
        {track && pathname !== '/now-playing' && (
          <Link className="now-marker" to="/now-playing" title={`Now playing: ${track.title}`}>
            <i aria-hidden="true" />
            <span>{track.title}</span>
          </Link>
        )}
        <button type="button" className="search-trigger" onClick={shell.openSearch} aria-keyshortcuts="/">
          Search <kbd>/</kbd>
        </button>
        {mode === 'preview' && auth ? (
          <button type="button" onClick={controls.exitPreview}>
            Connect Spotify
          </button>
        ) : (
          <span>{status}</span>
        )}
      </div>
    </header>
  );
}

/** Shown when a stored authorization predates scopes the app now requires. */
function ScopeNotice() {
  const auth = useAuthState();
  const services = useAppServices();
  const { pathname } = useLocation();
  if (auth.status !== 'signed-in' || auth.missingScopes.length === 0 || !services.auth) return null;
  return (
    <div className="scope-notice" role="status">
      <span>ARC needs {auth.missingScopes.length} more Spotify permission(s) for every feature.</span>
      <button type="button" className="note-more" onClick={() => void services.auth?.beginLogin(pathname)}>
        Reconnect Spotify →
      </button>
    </div>
  );
}

/**
 * The persistent v7 shell: rail, top bar, routed stage, and the overlays
 * (search, settings, the shared right drawer for notes and the queue).
 * There is no global playback footer — transport lives on Now Playing only —
 * and playback survives every route change.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeQueue = useCallback(() => setQueueOpen(false), []);
  const controls = useMemo<ShellControls>(
    () => ({
      openSearch: () => setSearchOpen(true),
      openQueue: () => setQueueOpen(true),
      toggleSettings: () => setSettingsOpen((value) => !value),
    }),
    [],
  );

  useEffect(() => {
    setSettingsOpen(false);
  }, [pathname]);

  return (
    <ShellContext.Provider value={controls}>
      <NoteProvider>
        <div className="app">
          <a href="#main" className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus(); }}>
            Skip to content
          </a>
          <Rail />
          <main className="workspace">
            <TopBar />
            <ScopeNotice />
            <section className="stage" id="main" tabIndex={-1}>
              <RouteErrorBoundary resetKey={pathname}>
                <Outlet />
              </RouteErrorBoundary>
            </section>
          </main>
          <SettingsPanel open={settingsOpen} onClose={closeSettings} />
          <SearchOverlay open={searchOpen} onClose={closeSearch} />
          <QueueDrawer open={queueOpen} onClose={closeQueue} />
          <NoteDrawer />
          <AccentTokens />
          <GlobalShortcuts />
        </div>
      </NoteProvider>
    </ShellContext.Provider>
  );
}
