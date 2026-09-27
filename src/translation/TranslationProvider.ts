import type { TimedLyricLine } from '../lyrics/types';

export interface TranslationProvider {
  translateLines(lines: TimedLyricLine[], sourceLanguage: string | undefined, targetLanguage: string): Promise<string[]>;
}
