import { useRef, useState } from 'react';
import { formatDuration, formatDurationForSpeech } from '../../lib/format';
import { useEngine, usePlaybackPosition, usePlayerSnapshot, useProgressProperty } from '../../playback/hooks';
import { NextIcon, PlayIcon, PreviousIcon } from '../icons';
import { Slider } from '../Slider';

/**
 * The v7 transport at the foot of the listening column: previous / play-pause
 * / next and the seek bar with current and total time. Position comes from
 * the central playback clock — there is no independent timer here.
 */
export function Transport() {
  const snapshot = usePlayerSnapshot();
  const position = usePlaybackPosition();
  const engine = useEngine();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [previewMs, setPreviewMs] = useState<number | null>(null);
  useProgressProperty(sliderRef);

  const hasTrack = Boolean(snapshot.track);
  const paused = snapshot.paused;
  const duration = snapshot.durationMs;
  const playDisabled = !hasTrack || (paused ? snapshot.disallows.resuming : snapshot.disallows.pausing);
  const seekDisabled = !hasTrack || duration <= 0 || snapshot.disallows.seeking;

  return (
    <div className="player-transport">
      <div className="controls">
        <button
          type="button"
          title="Previous"
          aria-label="Previous track"
          disabled={!hasTrack || snapshot.disallows.skippingPrev}
          onClick={() => void engine.previous()}
        >
          <PreviousIcon />
        </button>
        <button
          type="button"
          className="play"
          title={paused ? 'Play (Space)' : 'Pause (Space)'}
          aria-label={paused ? 'Play' : 'Pause'}
          aria-keyshortcuts="Space"
          disabled={playDisabled}
          onClick={() => {
            engine.activateAudio();
            void engine.togglePlay();
          }}
        >
          <PlayIcon paused={paused} />
        </button>
        <button
          type="button"
          title="Next"
          aria-label="Next track"
          disabled={!hasTrack || snapshot.disallows.skippingNext}
          onClick={() => void engine.next()}
        >
          <NextIcon />
        </button>
      </div>
      <div className="progress-wrap">
        <span aria-hidden="true">{formatDuration(previewMs ?? position)}</span>
        <Slider
          ref={sliderRef}
          live
          label="Seek"
          value={duration > 0 ? position / duration : 0}
          disabled={seekDisabled}
          step={duration > 0 ? Math.min(1, 5000 / duration) : 0.05}
          bigStep={duration > 0 ? Math.min(1, 30000 / duration) : 0.2}
          scale={duration / 1000}
          valueText={(fraction) => `${formatDurationForSpeech(fraction * duration)} of ${formatDurationForSpeech(duration)}`}
          onPreview={(fraction) => setPreviewMs(fraction === null ? null : fraction * duration)}
          onCommit={(fraction) => void engine.seek(Math.min(fraction * duration, Math.max(0, duration - 750)))}
        />
        <span aria-hidden="true">{formatDuration(duration)}</span>
      </div>
    </div>
  );
}
