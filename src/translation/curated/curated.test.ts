import { describe, expect, it, vi } from 'vitest';
import { BoundedCache } from '../../lib/boundedCache';
import type { TimedLyrics } from '../../lyrics/types';
import { translateWithCurated } from '../translateLyrics';
import type { TranslationProvider } from '../TranslationProvider';
import { checkTranslation, formatLineTable, lineKeyRows } from './authoring';
import { applyCuratedTranslation, curatedTranslations, getCuratedTranslation, loadCuratedTranslations } from './index';
import { lyricLineHash, normaliseLyricLine } from './lineHash';
import { CuratedTranslationError, parseCuratedTranslation } from './parse';
import type { CuratedTranslation } from './types';

// Original test lines (not real lyrics).
const ORIGINAL = ['窓の外で街が静かに光る', 'Hold the line', '窓の外で街が静かに光る', '', '君の名前を呼んだ'];

const lyrics = (texts: string[]): TimedLyrics => ({ language: 'ja', lines: texts.map((text, i) => ({ startMs: i * 1000, text })) });

function file(overrides: Record<string, unknown> = {}) {
  return {
    trackIds: ['0000000000000000000001'],
    titles: ['テスト'],
    artistNames: ['Test Artist', 'テスト・アーティスト'],
    sourceLanguage: 'ja',
    targetLanguage: 'ko',
    brief: {
      speaker: '도시를 떠나는 화자',
      addressee: '오래 함께한 친구',
      register: 'haeche',
      pronouns: [{ source: '君', target: '너' }],
      reasoning: '친구에게 직접 말을 거는 구조라 해체로 통일한다.',
    },
    lines: {
      [lyricLineHash(ORIGINAL[0]!)!]: '창밖에서 거리가 조용히 빛나',
      [`${lyricLineHash(ORIGINAL[0]!)!}#2`]: '창밖의 거리는 아직도 조용히 빛나',
      [lyricLineHash(ORIGINAL[4]!)!]: '네 이름을 불렀어',
    },
    written: '2026-10-02',
    ...overrides,
  };
}

const curated = (overrides?: Record<string, unknown>): CuratedTranslation =>
  parseCuratedTranslation('test', 'test.json', file(overrides));

describe('curated translation files', () => {
  it('all parse, and none repeats a track ID', () => {
    const ids = curatedTranslations.flatMap((entry) => entry.trackIds);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = curatedTranslations.map((entry) => `${entry.artistNames[0]}/${entry.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('loads a file with its name as the key', () => {
    expect(loadCuratedTranslations({ '../../translations/test-artist/my-song.json': file() })[0]?.key).toBe('my-song');
  });

  it.each([
    ['an unknown speech level', { brief: { ...file().brief, register: 'banmal' } }, /brief\.register/],
    ['a missing reasoning', { brief: { ...file().brief, reasoning: '' } }, /brief\.reasoning/],
    ['a line key that is not a hash', { lines: { 'Hold the line': '버텨' } }, /not an 8-character hash/],
    ['an empty translation line', { lines: { '0a1b2c3d': ' ' } }, /non-empty translation/],
    ['no titles', { titles: [] }, /titles/],
    ['a malformed date', { written: '2 Oct 2026' }, /written/],
  ])('rejects %s', (_label, overrides, message) => {
    expect(() => curated(overrides)).toThrow(CuratedTranslationError);
    expect(() => curated(overrides)).toThrow(message);
  });
});

describe('line hashes', () => {
  it('ignore width, case, curly quotes and spacing', () => {
    expect(normaliseLyricLine('  Ｈold   the  LINE ')).toBe('hold the line');
    expect(lyricLineHash('Don’t panic')).toBe(lyricLineHash("don't  panic"));
    expect(lyricLineHash('   ')).toBeNull();
    expect(lyricLineHash('Hold the line')).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('applyCuratedTranslation', () => {
  it('matches lines by hash, honours per-occurrence overrides and reports the gaps', () => {
    expect(applyCuratedTranslation(lyrics(ORIGINAL), curated())).toEqual({
      lines: ['창밖에서 거리가 조용히 빛나', '', '창밖의 거리는 아직도 조용히 빛나', '', '네 이름을 불렀어'],
      missing: [1],
      total: 4,
      matched: 3,
    });
  });
});

describe('getCuratedTranslation', () => {
  const entries = [curated()];

  it('matches by Spotify ID, then by title and artist name', () => {
    expect(getCuratedTranslation({ id: '0000000000000000000001', targetLanguage: 'ko' }, entries)?.key).toBe('test');
    expect(getCuratedTranslation({ id: 'other', title: 'テスト', artistNames: ['テスト・アーティスト'], targetLanguage: 'ko-KR' }, entries)).not.toBeNull();
    expect(getCuratedTranslation({ title: 'テスト', artistNames: ['Someone Else'], targetLanguage: 'ko' }, entries)).toBeNull();
  });

  it('only returns translations into the requested language', () => {
    expect(getCuratedTranslation({ id: '0000000000000000000001', targetLanguage: 'en' }, entries)).toBeNull();
  });
});

describe('translateWithCurated', () => {
  const freshCache = () => new BoundedCache<string[]>({ prefix: `test.curated.${Math.random()}:`, maxEntries: 20 });
  const fakeProvider = () => {
    const translateLines = vi.fn(async (lines: { text: string }[]) => lines.map((line) => `[MT] ${line.text}`));
    return { provider: { id: 'fake', label: 'Fake', translateLines } satisfies TranslationProvider, translateLines };
  };

  it('uses the curated lines and machine-translates only the uncovered ones', async () => {
    const { provider, translateLines } = fakeProvider();
    const result = await translateWithCurated(provider, 't', lyrics(ORIGINAL), curated(), 'ko', freshCache());
    expect(translateLines).toHaveBeenCalledTimes(1);
    expect(translateLines.mock.calls[0]![0].map((line) => line.text)).toEqual(['Hold the line']);
    expect(result).toMatchObject({
      status: 'ready',
      lines: ['창밖에서 거리가 조용히 빛나', '[MT] Hold the line', '창밖의 거리는 아직도 조용히 빛나', '', '네 이름을 불렀어'],
      curated: { total: 4, matched: 3, machine: [1] },
    });
  });

  it('works without a machine provider', async () => {
    const result = await translateWithCurated(null, 't', lyrics(ORIGINAL), curated(), 'ko', freshCache());
    expect(result).toMatchObject({ status: 'ready', lines: ['창밖에서 거리가 조용히 빛나', '', '창밖의 거리는 아직도 조용히 빛나', '', '네 이름을 불렀어'] });
  });

  it('falls back to machine translation when the lyrics are a different version', async () => {
    const { provider } = fakeProvider();
    const other = lyrics(['Completely different line']);
    expect(await translateWithCurated(provider, 't', other, curated(), 'ko', freshCache())).toEqual({
      status: 'ready',
      lines: ['[MT] Completely different line'],
    });
    expect((await translateWithCurated(null, 't', other, curated(), 'ko', freshCache())).status).toBe('unavailable');
  });
});

describe('authoring helpers', () => {
  it('lists each line with the key to use and marks repeats', () => {
    const rows = lineKeyRows(lyrics(ORIGINAL));
    expect(rows.map((row) => [row.number, row.occurrence, row.text])).toEqual([
      [1, 1, ORIGINAL[0]],
      [2, 1, 'Hold the line'],
      [3, 2, ORIGINAL[0]],
      [4, 1, ORIGINAL[4]],
    ]);
    expect(rows[2]!.hash).toBe(rows[0]!.hash);
    expect(formatLineTable(lyrics(ORIGINAL)).split('\n')[2]).toMatch(/^ {2}3 {2}[0-9a-f]{8}#2 {4}窓の外で/);
  });

  it('reports untranslated lines and keys that match nothing', () => {
    const entry = curated({ lines: { ...file().lines, '0a1b2c3d': '어디에도 없는 줄' } });
    const report = checkTranslation(lyrics(ORIGINAL), entry);
    expect(report.total).toBe(4);
    expect(report.matched).toBe(3);
    expect(report.untranslated.map((row) => row.text)).toEqual(['Hold the line']);
    expect(report.unusedKeys).toEqual(['0a1b2c3d']);
  });
});
