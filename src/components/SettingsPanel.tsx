import { useAuth } from '../auth/AuthContext';
import { useSpotifyEmbed } from '../playback/SpotifyEmbedContext';

export const SettingsPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const auth = useAuth();
  const player = useSpotifyEmbed();
  if (!open) return null;

  return (
    <div className="settings-panel" role="dialog" aria-label="ARC Music settings">
      <div className="settings-head"><span>Settings</span><button type="button" onClick={onClose} aria-label="Close settings">×</button></div>
      <div className="settings-body">
        <div className="label">Spotify catalog</div>
        <p>{!auth.hasClientId ? 'Client ID not configured' : auth.status}</p>
        {!auth.hasClientId && <p className="settings-help">Add <code>VITE_SPOTIFY_CLIENT_ID</code> as a GitHub Actions variable. Playback itself uses Spotify Embed; login is for search and metadata.</p>}
        {auth.error && <p className="settings-error">{auth.error}</p>}
        {player.error && <p className="settings-error">{player.error}</p>}
        {auth.hasClientId && auth.status !== 'connected' && <button type="button" className="plain-action" onClick={() => void auth.connect()}>Connect Spotify</button>}
        {auth.status === 'connected' && <button type="button" className="plain-action" onClick={auth.signOut}>Disconnect catalog</button>}
      </div>
    </div>
  );
};
