import { useSession } from '../../app/sessionContext';
import { useEngine, usePlayerSelector } from '../../playback/hooks';

/**
 * The quiet status line under the transport: where playback is happening, or
 * a problem with a way forward. Never a modal, never blocks playback.
 */
export function PlaybackNotice() {
  const engine = useEngine();
  const { mode, store } = useSession();
  const issue = usePlayerSelector((s) => s.issue);
  const device = usePlayerSelector((s) => s.snapshot.device);
  const source = usePlayerSelector((s) => s.snapshot.source);
  const sdk = usePlayerSelector((s) => s.sdk);

  const playHere =
    sdk.kind === 'ready' ? (
      <button
        type="button"
        className="notice-action"
        onClick={() => {
          engine.activateAudio();
          void engine.transferToBrowser(true);
        }}
      >
        Play in this browser
      </button>
    ) : null;

  if (issue) {
    const alert = issue.kind !== 'autoplay-blocked';
    return (
      <div className={alert ? 'playback-state alert' : 'playback-state'} role={alert ? 'alert' : 'status'}>
        <span>{issue.message}</span>
        {(issue.kind === 'autoplay-blocked' || issue.kind === 'playback-failed') && (
          <button
            type="button"
            className="notice-action"
            onClick={() => {
              engine.activateAudio();
              void engine.resume();
            }}
          >
            {issue.kind === 'autoplay-blocked' ? 'Start audio' : 'Try again'}
          </button>
        )}
        {issue.kind === 'no-active-device' && playHere}
        <button type="button" className="notice-action" onClick={() => store.dispatch({ type: 'issue/clear' })}>
          Dismiss
        </button>
        {issue.hints && issue.hints.length > 0 && (
          <ul className="notice-hints">
            {issue.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        )}
        {issue.detail && <p className="notice-detail">{issue.detail}</p>}
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <p className="playback-state" role="status">
        Preview — timing is simulated and no audio plays.
      </p>
    );
  }

  if (source === 'remote' && device) {
    return (
      <p className="playback-state" role="status">
        <span>
          Playing on <b>{device.name}</b>
        </span>
        {playHere}
      </p>
    );
  }

  if (source === 'sdk') {
    return (
      <p className="playback-state" role="status">
        Spotify Web Playback SDK · this browser
      </p>
    );
  }

  return <p className="playback-state" aria-hidden="true" />;
}
