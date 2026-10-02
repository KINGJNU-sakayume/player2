import { BoundedCache } from '../lib/boundedCache';
import { hashString } from '../lib/hash';
import type { TimedLyrics } from '../lyrics/types';
import { applyCuratedTranslation, type CuratedTranslation } from './curated';
import { detectLineLanguages, sameLanguage } from './languageDetect';
import { TranslationUnavailableError, type TranslationProvider } from './TranslationProvider';

/** How much of the lyrics a curated translation covered. */
export interface CuratedCoverage {
  translation: CuratedTranslation;
  /** Lines with text, and how many of them the curated file covered. */
  total: number;
  matched: number;
  /** Line indices the curated file did not cover that the machine provider filled in. */
  machine: number[];
}

export type LyricTranslationResult =
  /** Every line is already in the target language. */
  | { status: 'not-needed' }
  /** One entry per lyric line; empty string when the line has no translation. */
  | { status: 'ready'; lines: string[]; curated?: CuratedCoverage }
  | { status: 'needs-download'; sourceLanguage: string }
  | { status: 'unavailable'; message: string };

const TTL_MS = 60 * 24 * 60 * 60_000;
const defaultCache = new BoundedCache<string[]>({ prefix: 'arc.translation.v1:', maxEntries: 150 });

/**
 * Translates only the lines that are not already in the target language,
 * grouped by detected source language (mixed Korean/English lyrics translate
 * just the English lines). Results are cached by provider, track, language
 * pair and a hash of the source text.
 */
export async function translateLyrics(
  provider: TranslationProvider,
  trackId: string,
  lyrics: TimedLyrics,
  targetLanguage: string,
  cache: BoundedCache<string[]> = defaultCache,
): Promise<LyricTranslationResult> {
  const texts = lyrics.lines.map((line) => line.text);
  const languages = detectLineLanguages(texts, lyrics.language);

  const groups = new Map<string, number[]>();
  languages.forEach((language, index) => {
    if (!language || sameLanguage(language, targetLanguage)) return;
    const group = groups.get(language) ?? [];
    group.push(index);
    groups.set(language, group);
  });
  if (groups.size === 0) return { status: 'not-needed' };

  const output = texts.map(() => '');
  for (const [sourceLanguage, indices] of groups) {
    const groupLines = indices.map((i) => lyrics.lines[i]!);
    const key = `${provider.id}:${trackId}:${sourceLanguage}>${targetLanguage}:${hashString(groupLines.map((l) => l.text).join('\n'))}`;
    let translated = cache.get(key);
    if (!translated) {
      if (provider.availability) {
        const availability = await provider.availability(sourceLanguage, targetLanguage);
        if (availability === 'needs-download') return { status: 'needs-download', sourceLanguage };
        if (availability === 'unavailable') {
          return { status: 'unavailable', message: 'Translation for this language is not available on this device.' };
        }
      }
      try {
        translated = await provider.translateLines(groupLines, sourceLanguage, targetLanguage);
      } catch (error) {
        if (error instanceof TranslationUnavailableError && error.reason === 'needs-download') {
          return { status: 'needs-download', sourceLanguage };
        }
        return {
          status: 'unavailable',
          message: error instanceof Error ? error.message : 'Translation failed.',
        };
      }
      if (translated.length !== groupLines.length) {
        return { status: 'unavailable', message: 'The translation provider returned an incomplete result.' };
      }
      cache.set(key, translated, TTL_MS);
    }
    indices.forEach((lineIndex, i) => {
      output[lineIndex] = translated![i] ?? '';
    });
  }
  return output.some(Boolean) ? { status: 'ready', lines: output } : { status: 'unavailable', message: 'No translation was produced.' };
}

/**
 * A curated translation first; lines it does not cover (a different lyrics
 * version, an added ad-lib) go to the machine provider when there is one.
 * When no line matches at all, the curated file is for another version of the
 * lyrics and plain machine translation is used instead.
 */
export async function translateWithCurated(
  provider: TranslationProvider | null,
  trackId: string,
  lyrics: TimedLyrics,
  curated: CuratedTranslation,
  targetLanguage: string,
  cache: BoundedCache<string[]> = defaultCache,
): Promise<LyricTranslationResult> {
  const applied = applyCuratedTranslation(lyrics, curated);
  if (applied.matched === 0) {
    return provider
      ? translateLyrics(provider, trackId, lyrics, targetLanguage, cache)
      : { status: 'unavailable', message: 'The curated translation is for a different version of these lyrics.' };
  }
  const lines = [...applied.lines];
  const machine: number[] = [];
  if (provider && applied.missing.length > 0) {
    const rest: TimedLyrics = { ...lyrics, lines: applied.missing.map((index) => lyrics.lines[index]!) };
    const result = await translateLyrics(provider, trackId, rest, targetLanguage, cache);
    if (result.status === 'ready') {
      applied.missing.forEach((lineIndex, i) => {
        const text = result.lines[i]?.trim();
        if (!text) return;
        lines[lineIndex] = text;
        machine.push(lineIndex);
      });
    }
  }
  return { status: 'ready', lines, curated: { translation: curated, total: applied.total, matched: applied.matched, machine } };
}
