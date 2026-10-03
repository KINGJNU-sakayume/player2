import type { LyricsProviderId } from '../app/config';
import { withLyricsCache } from './lyricsCache';
import { LrclibLyricsProvider } from './providers/LrclibLyricsProvider';
import { MockLyricsProvider } from './providers/MockLyricsProvider';
import { CuratedFirstLyricsProvider } from './providers/CuratedFirstLyricsProvider';
import type { LyricsProvider } from './types';

/** Selects the lyrics provider for a Spotify session. Swap providers here. */
export function createLyricsProvider(id: LyricsProviderId): LyricsProvider | null {
  switch (id) {
    case 'lrclib':
      return new CuratedFirstLyricsProvider(withLyricsCache(new LrclibLyricsProvider()));
    case 'mock':
      return new CuratedFirstLyricsProvider(new MockLyricsProvider({ generic: true }));
    case 'none':
      return null;
  }
}
