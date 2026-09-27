import { useEffect, useState } from 'react';
import type { PlayerSnapshot } from '../data/types';

export const interpolatePosition = (snapshot: PlayerSnapshot | null, now = Date.now()) => {
  if (!snapshot) return 0;
  if (snapshot.paused) return snapshot.positionMs;
  return Math.min(snapshot.durationMs, snapshot.positionMs + Math.max(0, now - snapshot.updatedAt));
};

export const useInterpolatedPosition = (snapshot: PlayerSnapshot | null) => {
  const [position, setPosition] = useState(snapshot?.positionMs ?? 0);

  useEffect(() => {
    if (!snapshot) {
      setPosition(0);
      return;
    }
    setPosition(snapshot.positionMs);
    if (snapshot.paused) return;

    let frame = 0;
    const tick = () => {
      setPosition(interpolatePosition(snapshot));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [snapshot]);

  return position;
};
