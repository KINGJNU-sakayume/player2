import type { TrackIdentity } from '../../domain/types';
import { curatedToTimedLyrics, getCuratedLyrics } from '../curated';
import type { CuratedLyrics } from '../curated/types';
import type { LyricsProvider, LyricsRequestOptions, TimedLyrics } from '../types';

export class CuratedFirstLyricsProvider implements LyricsProvider {
  readonly id: string;
  readonly label: string;
  constructor(private readonly fallback: LyricsProvider, private readonly packages?: readonly CuratedLyrics[]) {
    this.id = `curated-first:${fallback.id}`;
    this.label = fallback.label;
  }
  getTimedLyrics(track: TrackIdentity, options?: LyricsRequestOptions): Promise<TimedLyrics | null> {
    const curated = getCuratedLyrics(track, this.packages);
    return curated ? Promise.resolve(curatedToTimedLyrics(curated)) : this.fallback.getTimedLyrics(track, options);
  }
}
