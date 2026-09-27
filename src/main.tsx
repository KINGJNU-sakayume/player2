import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { ArchiveProvider } from './app/ArchiveContext';
import { AuthProvider } from './auth/AuthContext';
import { NoteProvider } from './components/NoteContext';
import { SpotifyEmbedProvider } from './playback/SpotifyEmbedContext';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ArchiveProvider>
          <SpotifyEmbedProvider>
            <NoteProvider>
              <App />
            </NoteProvider>
          </SpotifyEmbedProvider>
        </ArchiveProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
