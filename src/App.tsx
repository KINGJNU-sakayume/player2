import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { NowPlayingPage } from './pages/NowPlayingPage';

export const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path="/now-playing" element={<NowPlayingPage />} />
      <Route path="/artist/:artistId" element={<ArtistPage />} />
      <Route path="/album/:albumId" element={<AlbumPage />} />
      <Route path="*" element={<Navigate to="/now-playing" replace />} />
    </Route>
  </Routes>
);
