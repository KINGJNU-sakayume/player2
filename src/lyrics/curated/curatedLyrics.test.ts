import { describe, expect, it, vi } from 'vitest';
import type { TrackIdentity } from '../../domain/types';
import type { LyricsProvider } from '../types';
import { curatedToTimedLyrics, getCuratedLyrics, loadCuratedLyrics } from './index';
import { CuratedLyricsError, parseCuratedLyrics } from './parse';
import { CuratedFirstLyricsProvider } from '../providers/CuratedFirstLyricsProvider';

const raw = (overrides: Record<string, unknown> = {}) => ({
  trackIds: ['release-a', 'release-b'], titles: ['Test Song'], artistNames: ['Test Artist'],
  sourceLanguage: 'en', targetLanguage: 'ko',
  brief: { speaker: '친구', addressee: '친구', relationship: '친한 친구', situation: '대화', register: 'haeche', reasoning: '친구에게 하는 말이다.', sources: [] },
  lines: [{ startMs: 1200, text: 'One complete sentence', translation: '하나의 온전한 문장' }], written: '2026-10-03', ...overrides,
});
const packages = () => loadCuratedLyrics({ './test-artist/test-song.json': raw() });
const track = (id = 'release-a', title = 'Test Song', artist = 'Test Artist'): TrackIdentity => ({
  spotifyTrackId: id, uri: `spotify:track:${id}`, title, artists: [{ id: 'artist', uri: 'spotify:artist:artist', name: artist }],
  album: { id: 'album', uri: 'spotify:album:album', name: 'Album', images: [] }, durationMs: 10000,
});

describe('complete curated lyric packages', () => {
  it('keeps source, timestamp and translation in the same validated line object', () => {
    const entry = packages()[0]!;
    expect(entry.lines[0]).toEqual({ startMs: 1200, text: 'One complete sentence', translation: '하나의 온전한 문장', endMs: undefined });
    expect(curatedToTimedLyrics(entry).curated).toBe(entry);
  });

  it('matches every listed release ID, then title and artist aliases', () => {
    expect(getCuratedLyrics(track('release-b'), packages())?.key).toBe('test-song');
    expect(getCuratedLyrics(track('unknown', 'Test Song - 2012 Remaster'), packages())?.key).toBe('test-song');
    expect(getCuratedLyrics(track('unknown', 'Test Song', 'Other'), packages())).toBeNull();
  });

  it.each([
    ['an empty translation', { lines: [{ startMs: 1, text: 'line', translation: '' }] }, /translation/],
    ['an empty original', { lines: [{ startMs: 1, text: '', translation: '번역' }] }, /text/],
    ['unordered timestamps', { lines: [{ startMs: 2, text: 'a', translation: '가' }, { startMs: 1, text: 'b', translation: '나' }] }, /startMs/],
    ['missing lines', { lines: [] }, /non-empty list/],
  ])('rejects %s', (_label, override, message) => {
    expect(() => parseCuratedLyrics('bad', 'bad.json', raw(override))).toThrow(CuratedLyricsError);
    expect(() => parseCuratedLyrics('bad', 'bad.json', raw(override))).toThrow(message);
  });
});

describe('curated-first provider', () => {
  it('returns local lyrics without contacting LRCLIB (so its segmentation cannot affect them)', async () => {
    const getTimedLyrics = vi.fn(async () => ({ lines: [{ startMs: 0, text: 'split' }, { startMs: 1, text: 'differently' }] }));
    const fallback: LyricsProvider = { id: 'lrclib', label: 'LRCLIB', getTimedLyrics };
    const result = await new CuratedFirstLyricsProvider(fallback, packages()).getTimedLyrics(track());
    expect(getTimedLyrics).not.toHaveBeenCalled();
    expect(result?.lines.map((line) => line.text)).toEqual(['One complete sentence']);
    expect(result?.curated?.lines[0]?.translation).toBe('하나의 온전한 문장');
  });

  it('uses LRCLIB unchanged for a song with no local package', async () => {
    const remote = { source: 'LRCLIB', lines: [{ startMs: 5, text: 'Remote line' }] };
    const getTimedLyrics = vi.fn(async () => remote);
    const result = await new CuratedFirstLyricsProvider({ id: 'lrclib', label: 'LRCLIB', getTimedLyrics }, packages()).getTimedLyrics(track('none', 'Other', 'Other'));
    expect(getTimedLyrics).toHaveBeenCalledOnce();
    expect(result).toBe(remote);
  });
});

describe('Starman regression', () => {
  it('loads its authoritative unsplit chorus and reviewed Korean translation', () => {
    const entry = getCuratedLyrics(track('6A1qZSENVbwBTZSljp1viz', 'Starman', 'David Bowie'))!;
    expect(entry).not.toBeNull();
    expect(entry.lines.some((line) => line.text.toLowerCase() === "there's a starman waiting in the sky" && line.translation === '하늘에서 스타맨이 기다리고 있어')).toBe(true);
  });
});
