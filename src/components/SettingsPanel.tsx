import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppServices, useAuthState } from '../app/appContext';
import { useSessionControls } from '../app/sessionControls';
import { useSession } from '../app/sessionContext';
import { useIsMobile } from '../app/useIsMobile';
import { useEngine, usePlayerSelector } from '../playback/hooks';
import { usePreferences } from '../preferences/preferences';
import { BottomSheet } from './BottomSheet';
import { InstallHint } from './mobile/InstallHint';

function sdkLabel(kind: string): string {
  switch (kind) {
    case 'ready':
      return 'Browser device ready';
    case 'loading':
      return 'Starting browser device…';
    case 'reconnecting':
      return 'Reconnecting browser device…';
    case 'error':
      return 'Browser device unavailable';
    default:
      return 'Browser device off';
  }
}

/** Small settings sheet beside the rail: account, device, translation, preview. */
export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, auth } = useAppServices();
  const authState = useAuthState();
  const controls = useSessionControls();
  const { mode, translation, lyrics } = useSession();
  const engine = useEngine();
  const sdk = usePlayerSelector((s) => s.sdk);
  const [preferences, setPreferences] = usePreferences();
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const missing = authState.status === 'signed-in' ? authState.missingScopes : [];

  const body = (
    <div className="settings-body">
      <div className="label">Spotify</div>
      {mode === 'preview' ? (
        <p>Preview archive · sample data, simulated clock, no audio.</p>
      ) : mobile ? (
        <p>Connected · this phone is the remote. The Spotify app, or another device signed in to your account, plays the audio.</p>
      ) : (
        <p>
          Connected · {sdk.kind === 'error' ? `${sdkLabel(sdk.kind)} — ${sdk.message}` : sdkLabel(sdk.kind)}
        </p>
      )}
      {missing.length > 0 && (
        <p className="settings-error">
          {missing.length} permission(s) are missing for all features.{' '}
          <button type="button" className="note-more" onClick={() => void auth?.beginLogin(pathname)}>
            Reconnect
          </button>
        </p>
      )}
      <div className="settings-actions">
        {mode === 'spotify' && sdk.kind === 'ready' && (
          <button
            type="button"
            className="plain-action"
            onClick={() => {
              engine.activateAudio();
              void engine.transferToBrowser(false);
            }}
          >
            Use browser device
          </button>
        )}
        {mode === 'preview' ? (
          <button type="button" className="plain-action" onClick={controls.exitPreview}>
            {auth ? 'Connect Spotify' : 'Exit preview'}
          </button>
        ) : (
          <button type="button" className="plain-action" onClick={controls.signOut}>
            Disconnect
          </button>
        )}
      </div>

      <div className="label">Lyrics</div>
      <p>
        {lyrics ? `Timed lyrics: ${lyrics.label}` : 'Lyrics are turned off.'}
        {translation ? ` · Translation: ${translation.label} → ${config.translationTarget}` : ' · No translation provider.'}
      </p>
      {translation && (
        <div className="settings-actions">
          <button
            type="button"
            className="plain-action"
            aria-pressed={preferences.translationEnabled}
            onClick={() => setPreferences({ translationEnabled: !preferences.translationEnabled })}
          >
            Translation {preferences.translationEnabled ? 'on' : 'off'}
          </button>
        </div>
      )}
      {mobile ? (
        <InstallHint />
      ) : (
        <p className="settings-help">
          Shortcuts: <kbd>/</kbd> search · <kbd>Space</kbd> play / pause
        </p>
      )}
    </div>
  );

  if (mobile) {
    return (
      <BottomSheet open onClose={onClose} label="Settings" ariaLabel="ARC Music settings" closeLabel="Close settings">
        {body}
      </BottomSheet>
    );
  }

  return (
    <div ref={panelRef} className="settings-panel" role="dialog" aria-label="ARC Music settings">
      <div className="settings-head">
        <span>Settings</span>
        <button type="button" onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </div>
      {body}
    </div>
  );
}
