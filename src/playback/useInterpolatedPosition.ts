import { useEffect, useState } from 'react';
import type { PlayerSnapshot } from '../data/types';

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
      const elapsed = Date.now() - snapshot.updatedAt;
      setPosition(Math.min(snapshot.durationMs, snapshot.positionMs + elapsed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [snapshot]);

  return position;
};
