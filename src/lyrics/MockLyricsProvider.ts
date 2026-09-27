import type { TrackIdentity } from '../data/types';
import type { LyricsProvider, TimedLyrics } from './types';

const copyByLanguage: Record<string, string[]> = {
  Japanese: ['歌詞プレビュー', 'これは開発用の合成歌詞です。', '次の歌詞ライン', 'その次の歌詞ライン'],
  Korean: ['가사 프리뷰', '개발용 합성 가사입니다.', '다음 가사 라인', '그 다음 가사 라인'],
  English: ['Lyric preview', 'Synthetic development lyrics only.', 'Next lyric line', 'Following lyric line'],
};

export class MockLyricsProvider implements LyricsProvider {
  async getTimedLyrics(track: TrackIdentity): Promise<TimedLyrics> {
    const copy = copyByLanguage[track.language ?? ''] ?? copyByLanguage.English;
    const slot = Math.max(12000, Math.floor(track.durationMs / copy.length));
    return {
      language: track.language,
      lines: copy.map((text, index) => ({
        startMs: index * slot,
        endMs: Math.min(track.durationMs, (index + 1) * slot),
        text,
      })),
    };
  }
}
