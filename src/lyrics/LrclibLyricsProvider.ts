import type { TrackIdentity } from '../data/types';
import type { LyricsProvider, TimedLyricLine, TimedLyrics } from './types';

type LrclibResponse = {
  id: number;
  instrumental: boolean;
  syncedLyrics?: string | null;
};

const parseTimestamp = (minutes: string, seconds: string) =>
  Math.round((Number(minutes) * 60 + Number(seconds)) * 1000);

export const parseLrc = (raw: string): TimedLyricLine[] => {
  const lines = raw
    .split(/\r?\n/)
    .map((row) => {
      const match = row.match(/^\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]\s?(.*)$/);
      if (!match) return null;
      return { startMs: parseTimestamp(match[1], match[2]), text: match[3].trim() };
    })
    .filter((line): line is TimedLyricLine => Boolean(line))
    .sort((a, b) => a.startMs - b.startMs);

  return lines.map((line, index) => ({
    ...line,
    endMs: lines[index + 1]?.startMs,
  }));
};

export class LrclibLyricsProvider implements LyricsProvider {
  async getTimedLyrics(track: TrackIdentity): Promise<TimedLyrics | null> {
    const artistName = track.artists[0]?.name;
    if (!artistName || !track.album.name || !track.durationMs) return null;

    const params = new URLSearchParams({
      track_name: track.title,
      artist_name: artistName,
      album_name: track.album.name,
      duration: String(Math.max(1, Math.round(track.durationMs / 1000))),
    });

    const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Lyrics provider failed (${response.status}).`);

    const payload = (await response.json()) as LrclibResponse;
    if (payload.instrumental || !payload.syncedLyrics) return null;
    const lines = parseLrc(payload.syncedLyrics);
    if (!lines.length) return null;
    return { lines, source: `LRCLIB #${payload.id}` };
  }
}
