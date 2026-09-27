import type { TrackIdentity } from '../data/types';
import type { LyricsProvider, TimedLyricLine, TimedLyrics } from './types';

type LrclibResult = { id: number; syncedLyrics?: string | null; instrumental?: boolean };

const cache = new Map<string, TimedLyrics | null>();

export const parseLrc = (source: string): TimedLyricLine[] => {
  const lines: TimedLyricLine[] = [];
  for (const row of source.split(/\r?\n/)) {
    const matches = [...row.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const text = row.replace(/\[[^\]]+\]/g, '').trim();
    if (!text) continue;
    for (const match of matches) {
      const fraction = (match[3] ?? '').padEnd(3, '0').slice(0, 3);
      lines.push({ startMs: Number(match[1]) * 60_000 + Number(match[2]) * 1000 + Number(fraction), text });
    }
  }
  lines.sort((a, b) => a.startMs - b.startMs);
  return lines.map((line, index) => ({ ...line, endMs: lines[index + 1]?.startMs }));
};

export class LrclibLyricsProvider implements LyricsProvider {
  async getTimedLyrics(track: TrackIdentity, signal?: AbortSignal): Promise<TimedLyrics | null> {
    const key = `${track.id}:${track.durationMs}`;
    if (cache.has(key)) return cache.get(key) ?? null;
    const params = new URLSearchParams({
      track_name: track.title,
      artist_name: track.artists[0]?.name ?? '',
      album_name: track.album.name,
      duration: String(Math.round(track.durationMs / 1000)),
    });
    let response = await fetch(`https://lrclib.net/api/get?${params}`, { signal });
    let result: LrclibResult | undefined;
    if (response.ok) result = await response.json() as LrclibResult;
    if (!result?.syncedLyrics && response.status === 404) {
      const search = new URLSearchParams({ track_name: track.title, artist_name: track.artists[0]?.name ?? '' });
      response = await fetch(`https://lrclib.net/api/search?${search}`, { signal });
      if (!response.ok) throw new Error(`Lyrics provider returned ${response.status}.`);
      const candidates = await response.json() as LrclibResult[];
      result = candidates.find((item) => item.syncedLyrics);
    } else if (!response.ok) {
      throw new Error(`Lyrics provider returned ${response.status}.`);
    }
    const lines = result?.syncedLyrics ? parseLrc(result.syncedLyrics) : [];
    const value = lines.length ? { lines } : null;
    cache.set(key, value);
    return value;
  }
}
