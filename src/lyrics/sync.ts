import type { TimedLyricLine } from './types';

export type LyricWindow = {
  current: TimedLyricLine | null;
  next: TimedLyricLine | null;
  secondNext: TimedLyricLine | null;
  index: number;
};

export const getLyricWindow = (lines: TimedLyricLine[], positionMs: number): LyricWindow => {
  if (!lines.length) return { current: null, next: null, secondNext: null, index: -1 };

  let index = -1;
  for (let cursor = lines.length - 1; cursor >= 0; cursor -= 1) {
    const line = lines[cursor];
    const hasStarted = line.startMs <= positionMs;
    const notEnded = line.endMs === undefined || positionMs < line.endMs;
    if (hasStarted && notEnded) {
      index = cursor;
      break;
    }
    if (hasStarted && index === -1) {
      index = cursor;
      break;
    }
  }

  if (index < 0) index = 0;
  return {
    current: lines[index] ?? null,
    next: lines[index + 1] ?? null,
    secondNext: lines[index + 2] ?? null,
    index,
  };
};
