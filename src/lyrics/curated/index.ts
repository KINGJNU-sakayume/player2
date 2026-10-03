import { fileKey } from '../../editorial/frontmatter';
import { namesMatch, normaliseTitle } from '../../editorial/lookup';
import type { TrackIdentity } from '../../domain/types';
import type { TimedLyrics } from '../types';
import { parseCuratedLyrics } from './parse';
import type { CuratedLyrics } from './types';

export type CuratedLyricsFiles = Record<string, unknown>;
export function loadCuratedLyrics(files: CuratedLyricsFiles): CuratedLyrics[] {
  return Object.keys(files).sort().map((file) => parseCuratedLyrics(fileKey(file), file, files[file]));
}
export const curatedLyrics = loadCuratedLyrics(import.meta.glob('./**/*.json', { eager: true, import: 'default' }));

export function getCuratedLyrics(track: Pick<TrackIdentity, 'spotifyTrackId' | 'title' | 'artists'>, packages: readonly CuratedLyrics[] = curatedLyrics): CuratedLyrics | null {
  const byId = packages.find((entry) => entry.trackIds.includes(track.spotifyTrackId));
  if (byId) return byId;
  const title = normaliseTitle(track.title);
  return packages.find((entry) => entry.titles.some((value) => normaliseTitle(value) === title) && namesMatch(entry.artistNames, track.artists.map((artist) => artist.name))) ?? null;
}

export function curatedToTimedLyrics(entry: CuratedLyrics): TimedLyrics {
  return { language: entry.sourceLanguage, source: 'Local curated', curated: entry, lines: entry.lines.map(({ startMs, endMs, text }) => ({ startMs, endMs, text })) };
}
