import type { TimedLyricLine } from '../lyrics/types';
import type { TranslationProvider } from './TranslationProvider';

export class MockTranslationProvider implements TranslationProvider {
  async translateLines(lines: TimedLyricLine[], _sourceLanguage: string | undefined, targetLanguage: string) {
    if (targetLanguage !== 'ko') return lines.map(() => 'Synthetic translation preview');
    return lines.map((_line, index) => `개발용 합성 번역 ${String(index + 1).padStart(2, '0')}`);
  }
}
