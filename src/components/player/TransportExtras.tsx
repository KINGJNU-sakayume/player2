import { useRef } from 'react';
import { useShell } from '../../app/shellContext';
import { useSavedState, useToggleSaved } from '../../catalogue/queries';
import { useEngine, usePlayerSnapshot } from '../../playback/hooks';
import { HeartIcon, QueueIcon, ShuffleIcon, VolumeIcon } from '../icons';
import { Slider } from '../Slider';
import { DevicePicker } from './DevicePicker';

/**
 * Secondary playback controls ported from the catalogue player — shuffle,
 * like, queue, device and volume — set as one quiet line beneath the v7
 * transport, in the same micro type as the rest of the listening column.
 */
export function TransportExtras() {
  const snapshot = usePlayerSnapshot();
  const engine = useEngine();
  const shell = useShell();
  const hasTrack = Boolean(snapshot.track);

  return (
    <div className="transport-extras">
      <div className="transport-extras-group">
        <button
          type="button"
          className="text-toggle"
          aria-pressed={snapshot.shuffle}
          disabled={!hasTrack || snapshot.disallows.togglingShuffle}
          onClick={() => void engine.setShuffle(!snapshot.shuffle)}
        >
          <ShuffleIcon />
          <span>Shuffle</span>
        </button>
        <LikeButton />
        <button type="button" className="text-toggle" aria-haspopup="dialog" onClick={shell.openQueue}>
          <QueueIcon />
          <span>Queue</span>
        </button>
      </div>
      <div className="transport-extras-group">
        <DevicePicker />
        <Volume />
      </div>
    </div>
  );
}

/** Like / unlike the current track (PUT | DELETE /me/library). */
function LikeButton() {
  const track = usePlayerSnapshot().track;
  const saved = useSavedState(track?.uri);
  const toggle = useToggleSaved();
  const isSaved = saved.data === true;
  const unknown = !track || saved.isPending || saved.isError;
  return (
    <button
      type="button"
      className="text-toggle"
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
      disabled={unknown || toggle.isPending}
      onClick={() => {
        if (track) toggle.mutate({ uri: track.uri, saved: !isSaved });
      }}
    >
      <HeartIcon filled={isSaved} />
      <span aria-hidden="true">{isSaved ? 'Liked' : 'Like'}</span>
    </button>
  );
}

function Volume() {
  const snapshot = usePlayerSnapshot();
  const engine = useEngine();
  const restoreTo = useRef(0.6);
  const volume = snapshot.volume ?? 0;
  const supported = Boolean(snapshot.track) && snapshot.volume !== null && snapshot.device?.supportsVolume !== false;
  const muted = volume <= 0.001;

  return (
    <div className="volume">
      <button
        type="button"
        className="icon-button"
        aria-label={muted ? 'Unmute' : 'Mute'}
        disabled={!supported}
        onClick={() => {
          if (muted) {
            void engine.setVolume(restoreTo.current || 0.6);
          } else {
            restoreTo.current = volume;
            void engine.setVolume(0);
          }
        }}
      >
        <VolumeIcon muted={muted} />
      </button>
      <Slider
        className="volume-slider"
        label="Volume"
        value={volume}
        disabled={!supported}
        step={0.05}
        bigStep={0.2}
        scale={100}
        valueText={(fraction) => `${Math.round(fraction * 100)} percent`}
        commitDelayMs={250}
        onCommit={(fraction) => void engine.setVolume(fraction)}
      />
    </div>
  );
}
