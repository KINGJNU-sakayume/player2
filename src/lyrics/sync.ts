import type { TimedLyricLine } from './types';

export type LyricWindow = {
  current: TimedLyricLine | null;
  next: TimedLyricLine | null;
  secondNext: TimedLyricLine | null;
  index: number;
};

export const getLyricWindow = (lines: TimedLyricLine[], positionMs: number): LyricWindow => {
  if (!lines.length) return { current: null, next: null, secondNext: null, index: -1 };

  let candidateIndex = -1;
  for (let cursor = lines.length - 1; cursor >= 0; cursor -= 1) {
    if (lines[cursor].startMs <= positionMs) {
      candidateIndex = cursor;
      break;
    }
  }

  if (candidateIndex < 0) {
    return {
      current: null,
      next: lines[0] ?? null,
      secondNext: lines[1] ?? null,
      index: -1,
    };
  }

  const candidate = lines[candidateIndex];
  const isActive = candidate.endMs === undefined || positionMs < candidate.endMs;
  if (!isActive) {
    return {
      current: null,
      next: lines[candidateIndex + 1] ?? null,
      secondNext: lines[candidateIndex + 2] ?? null,
      index: -1,
    };
  }

  return {
    current: candidate,
    next: lines[candidateIndex + 1] ?? null,
    secondNext: lines[candidateIndex + 2] ?? null,
    index: candidateIndex,
  };
};
