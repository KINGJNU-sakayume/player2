import type { TrackIdentity } from '../data/types';
import type { LyricsProvider, TimedLyricLine, TimedLyrics } from './types';

const LRCLIB_URL = 'https://lrclib.net/api';

type LrclibRecord = {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string | null;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
};

const normalize = (value: string | undefined | null) =>
  (value ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s\u00a0]+/g, ' ');

const timestampToMs = (minutes: string, seconds: string, fraction?: string) => {
  const wholeSeconds = Number(seconds);
  const fractionMs = fraction ? Number(fraction.padEnd(3, '0').slice(0, 3)) : 0;
  return Number(minutes) * 60_000 + wholeSeconds * 1000 + fractionMs;
};

export const parseSyncedLyrics = (source: string): TimedLyricLine[] => {
  const parsed: Array<{ startMs: number; text: string }> = [];

  for (const rawLine of source.split(/\r?\n/)) {
    const matches = [...rawLine.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (!matches.length) continue;

    const text = rawLine.replace(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g, '').trim();
    if (!text) continue;

    for (const match of matches) {
      parsed.push({
        startMs: timestampToMs(match[1], match[2], match[3]),
        text,
      });
    }
  }

  parsed.sort((a, b) => a.startMs - b.startMs);

  return parsed.map((line, index) => ({
    ...line,
    endMs: parsed[index + 1]?.startMs,
  }));
};

const detectLanguage = (lines: TimedLyricLine[]) => {
  const sample = lines.slice(0, 12).map((line) => line.text).join(' ');
  if (/[\uac00-\ud7af]/.test(sample)) return 'ko';
  if (/[\u3040-\u30ff]/.test(sample)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(sample)) return 'zh';
  return 'en';
};

const fetchRecord = async (url: URL): Promise<LrclibRecord | null> => {
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`LRCLIB request failed (${response.status}).`);
  return (await response.json()) as LrclibRecord;
};

const exactLookup = async (track: TrackIdentity, includeAlbum: boolean) => {
  const artist = track.artists[0]?.name;
  if (!artist) return null;

  const url = new URL(`${LRCLIB_URL}/get`);
  url.searchParams.set('track_name', track.title);
  url.searchParams.set('artist_name', artist);
  if (includeAlbum && track.album.name) url.searchParams.set('album_name', track.album.name);
  if (track.durationMs > 0) url.searchParams.set('duration', String(Math.round(track.durationMs / 1000)));
  return fetchRecord(url);
};

const searchLookup = async (track: TrackIdentity) => {
  const artist = track.artists[0]?.name ?? '';
  const url = new URL(`${LRCLIB_URL}/search`);
  url.searchParams.set('q', `${track.title} ${artist}`.trim());

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`LRCLIB search failed (${response.status}).`);
  const records = (await response.json()) as LrclibRecord[];
  const synced = records.filter((record) => Boolean(record.syncedLyrics));
  if (!synced.length) return null;

  const exactTitle = normalize(track.title);
  const exactArtist = normalize(artist);
  const durationSeconds = track.durationMs / 1000;

  return synced
    .map((record) => {
      let score = 0;
      if (normalize(record.trackName) === exactTitle) score += 5;
      if (normalize(record.artistName).includes(exactArtist) || exactArtist.includes(normalize(record.artistName))) score += 4;
      if (record.albumName && normalize(record.albumName) === normalize(track.album.name)) score += 2;
      if (record.duration && Math.abs(record.duration - durationSeconds) <= 3) score += 3;
      return { record, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.record ?? null;
};

export class LrclibLyricsProvider implements LyricsProvider {
  private readonly cache = new Map<string, Promise<TimedLyrics | null>>();

  getTimedLyrics(track: TrackIdentity): Promise<TimedLyrics | null> {
    const key = `${track.id}:${track.durationMs}`;
    const existing = this.cache.get(key);
    if (existing) return existing;

    const request = this.load(track).catch((cause) => {
      this.cache.delete(key);
      throw cause;
    });
    this.cache.set(key, request);
    return request;
  }

  private async load(track: TrackIdentity): Promise<TimedLyrics | null> {
    let record = await exactLookup(track, true);
    if (!record?.syncedLyrics) record = await exactLookup(track, false);
    if (!record?.syncedLyrics) record = await searchLookup(track);
    if (!record) return null;

    if (record.instrumental) {
      return { instrumental: true, source: 'LRCLIB', lines: [] };
    }
    if (!record.syncedLyrics) return null;

    const lines = parseSyncedLyrics(record.syncedLyrics);
    if (!lines.length) return null;

    return {
      source: 'LRCLIB',
      language: detectLanguage(lines),
      lines,
    };
  }
}
