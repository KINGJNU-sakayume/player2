import type { TrackIdentity } from '../data/types';

export type TimedLyricLine = {
  startMs: number;
  endMs?: number;
  text: string;
};

export type TimedLyrics = {
  language?: string;
  lines: TimedLyricLine[];
};

export interface LyricsProvider {
  getTimedLyrics(track: TrackIdentity): Promise<TimedLyrics | null>;
}
