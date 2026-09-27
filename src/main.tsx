import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { NoteProvider } from './components/NoteContext';
import { PlaybackProvider } from './playback/PlaybackContext';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <PlaybackProvider>
            <NoteProvider>
              <App />
            </NoteProvider>
        </PlaybackProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
