import { useAuth } from '../auth/AuthContext';
import { usePlayback } from '../playback/PlaybackContext';

export const SettingsPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const auth = useAuth();
  const playback = usePlayback();
  if (!open) return null;

  const statusLabel = !auth.hasClientId
    ? 'Client ID not configured'
    : auth.status === 'connected'
      ? `Connected · ${playback.status}`
      : auth.status;

  return (
    <div className="settings-panel" role="dialog" aria-label="ARC Music settings">
      <div className="settings-head"><span>Settings</span><button type="button" onClick={onClose} aria-label="Close settings">×</button></div>
      <div className="settings-body">
        <div className="label">Spotify</div>
        <p>{statusLabel}</p>
        {!auth.hasClientId && <p className="settings-help">Set <code>VITE_SPOTIFY_CLIENT_ID</code> at build time to enable PKCE login.</p>}
        {auth.error && <p className="settings-error">{auth.error}</p>}
        {playback.error && <p className="settings-error">{playback.error}</p>}
        {auth.hasClientId && auth.status !== 'connected' && <button type="button" className="plain-action" onClick={() => void auth.connect()}>Connect Spotify</button>}
        {auth.status === 'connected' && (
          <>
            {playback.status === 'ready' && <button type="button" className="plain-action" onClick={() => void playback.activateBrowser()}>Use browser device</button>}
            <button type="button" className="plain-action" onClick={auth.signOut}>Disconnect</button>
          </>
        )}
      </div>
    </div>
  );
};
