import type { TranslationBrief } from '../../translation/curated/types';

export interface CuratedLyricLine {
  startMs: number;
  endMs?: number;
  text: string;
  translation: string;
}

/** A complete, authoritative source/translation/timing package. */
export interface CuratedLyrics {
  key: string;
  trackIds: string[];
  titles: string[];
  artistNames: string[];
  sourceLanguage: string;
  targetLanguage: string;
  brief: TranslationBrief;
  lines: CuratedLyricLine[];
  lyricsSource?: { provider: string; id?: number | string; durationMs?: number; url?: string };
  written: string;
  updated?: string;
}
