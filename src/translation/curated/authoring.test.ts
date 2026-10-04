import { describe, expect, it } from 'vitest';
import type { TimedLyrics } from '../../lyrics/types';
import { checkTimeline } from './authoring';
import type { TranslationTimeline } from './types';

// Invented authoring input only; no song lyrics.
const lyrics: TimedLyrics = {
  language: 'ko',
  timing: { lrclibId: 123, durationMs: 10000 },
  lines: [
    { startMs: 1000, text: '한국어 검사 문장입니다' },
    { startMs: 3000, text: 'First English test sentence' },
    { startMs: 6000, text: 'Second English test sentence' },
  ],
};
const timeline: TranslationTimeline = {
  schemaVersion: 2,
  timing: { lrclibId: 123, durationMs: 10000 },
  segments: [{ startMs: 3000, endMs: 6000, translation: '첫 영어 검사 문장' }],
};

describe('checkTimeline', () => {
  it('allows native target-language lines while still requiring every foreign-language line', () => {
    const report = checkTimeline(lyrics, timeline, 'ko-KR');
    expect(report.total).toBe(2);
    expect(report.covered).toBe(1);
    expect(report.uncovered.map((row) => row.number)).toEqual([3]);
    expect(report.lrclibIdMatches).toBe(true);
    expect(report.durationMatches).toBe(true);
    expect(report.offGrid).toEqual([]);
  });

  it('requires all lines when no target language is supplied', () => {
    const report = checkTimeline(lyrics, timeline);
    expect(report.total).toBe(3);
    expect(report.uncovered.map((row) => row.number)).toEqual([1, 3]);
  });

  it('retains record, duration, and grid failures for mixed-language songs', () => {
    const report = checkTimeline(lyrics, {
      ...timeline,
      timing: { lrclibId: 456, durationMs: 14000 },
      segments: [{ startMs: 4500, endMs: 6000, translation: '검사 문장' }],
    }, 'ko');
    expect(report.lrclibIdMatches).toBe(false);
    expect(report.durationMatches).toBe(false);
    expect(report.offGrid).toEqual([{ segment: 0, startMs: 4500, nearestLineMs: 3000 }]);
    expect(report.uncovered.map((row) => row.number)).toEqual([3]);
  });
});
