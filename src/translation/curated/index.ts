import { fileKey } from '../../editorial/frontmatter';
import { namesMatch, normaliseTitle } from '../../editorial/lookup';
import type { TimedLyrics } from '../../lyrics/types';
import { sameLanguage } from '../languageDetect';
import { lyricLineHash } from './lineHash';
import { parseCuratedTranslation } from './parse';
import type { CuratedTranslation } from './types';

export type { CuratedTranslation } from './types';

/** `{ path: parsed JSON }`, as `import.meta.glob(…, { eager: true, import: 'default' })` returns. */
export type TranslationFiles = Record<string, unknown>;

export function loadCuratedTranslations(files: TranslationFiles): CuratedTranslation[] {
  return Object.keys(files)
    .sort()
    .map((file) => parseCuratedTranslation(fileKey(file), file, files[file]));
}

export const curatedTranslations: readonly CuratedTranslation[] = loadCuratedTranslations(
  import.meta.glob('../../translations/**/*.json', { eager: true, import: 'default' }),
);

export interface CuratedQuery {
  id?: string | null;
  title?: string | null;
  artistNames?: readonly string[];
  targetLanguage: string;
}

/** Spotify ID first; otherwise a normalised title plus one of the artist's names. */
export function getCuratedTranslation(
  query: CuratedQuery,
  translations: readonly CuratedTranslation[] = curatedTranslations,
): CuratedTranslation | null {
  const candidates = translations.filter((entry) => sameLanguage(entry.targetLanguage, query.targetLanguage));
  const byId = query.id ? candidates.find((entry) => entry.trackIds.includes(query.id!)) : undefined;
  if (byId) return byId;
  const title = normaliseTitle(query.title);
  if (!title || !query.artistNames?.length) return null;
  return (
    candidates.find(
      (entry) => entry.titles.some((t) => normaliseTitle(t) === title) && namesMatch(entry.artistNames, query.artistNames!),
    ) ?? null
  );
}

export interface AppliedCuratedTranslation {
  /** One entry per lyric line; '' where the curated file has no line. */
  lines: string[];
  /** Indices of lines with text that the curated file did not cover. */
  missing: number[];
  /** Lines with text, and how many of them the curated file covered. */
  total: number;
  matched: number;
}

/** Matches the curated lines to the lyrics loaded at runtime by line hash. */
export function applyCuratedTranslation(lyrics: TimedLyrics, curated: CuratedTranslation): AppliedCuratedTranslation {
  const occurrences = new Map<string, number>();
  const missing: number[] = [];
  let total = 0;
  const lines = lyrics.lines.map((line, index) => {
    const hash = lyricLineHash(line.text);
    if (!hash) return '';
    total += 1;
    const occurrence = (occurrences.get(hash) ?? 0) + 1;
    occurrences.set(hash, occurrence);
    const translated = curated.lines[`${hash}#${occurrence}`] ?? curated.lines[hash];
    if (translated === undefined) {
      missing.push(index);
      return '';
    }
    return translated;
  });
  return { lines, missing, total, matched: total - missing.length };
}
