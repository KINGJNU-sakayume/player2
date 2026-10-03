import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useSession } from '../app/sessionContext';
import type { TrackIdentity } from '../domain/types';
import { hashString } from '../lib/hash';
import type { TimedLyrics } from '../lyrics/types';
import type { CuratedLyrics } from '../lyrics/curated/types';
import { getCuratedTranslation, type CuratedTranslation } from './curated';
import { translateLyrics, translateWithCurated, type LyricTranslationResult } from './translateLyrics';

export type TranslationState =
  | { status: 'off' }
  | { status: 'unsupported' }
  | { status: 'loading' }
  | LyricTranslationResult;

/**
 * Translation for the current lyrics: the song's curated translation when the
 * archive has one, machine translation otherwise (and for the lines a curated
 * file does not cover). Independent of lyric display: when it fails, lyrics
 * keep working and only the translation row disappears.
 */
export function useLyricTranslation(
  track: TrackIdentity | null,
  lyrics: TimedLyrics | null,
  enabled: boolean,
): { state: TranslationState; prepare: (() => Promise<void>) | null; curated: CuratedTranslation | CuratedLyrics | null } {
  const { translation: provider, translationTarget, mode } = useSession();
  const queryClient = useQueryClient();
  const trackId = track?.spotifyTrackId ?? null;
  const curated = useMemo(
    () =>
      lyrics?.curated ?? (track
        ? getCuratedTranslation({
            id: track.spotifyTrackId,
            title: track.title,
            artistNames: track.artists.map((artist) => artist.name),
            targetLanguage: translationTarget,
          })
        : null),
    [track, lyrics?.curated, translationTarget],
  );
  const lyricsHash = lyrics ? hashString(lyrics.lines.map((l) => l.text).join('\n')) : null;
  const queryKey = [mode, 'translation', provider?.id, curated?.key ?? null, trackId, translationTarget, lyricsHash];

  const query = useQuery<LyricTranslationResult>({
    queryKey,
    enabled: Boolean(enabled && (provider || curated) && trackId && lyrics),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    queryFn: () => {
      if (lyrics?.curated) {
        const result: LyricTranslationResult = { status: 'ready', lines: lyrics.curated.lines.map((line) => line.translation), curated: { translation: lyrics.curated, total: lyrics.curated.lines.length, matched: lyrics.curated.lines.length, machine: [] } };
        return Promise.resolve(result);
      }
      return curated
        ? translateWithCurated(provider, trackId!, lyrics!, curated as CuratedTranslation, translationTarget)
        : translateLyrics(provider!, trackId!, lyrics!, translationTarget);
    },
  });

  const data = query.data;
  const sourceLanguage = data?.status === 'needs-download' ? data.sourceLanguage : null;
  const prepare = useCallback(async () => {
    if (!provider?.prepare || !sourceLanguage) return;
    await provider.prepare(sourceLanguage, translationTarget);
    await queryClient.invalidateQueries({
      queryKey: [mode, 'translation', provider.id, curated?.key ?? null, trackId, translationTarget, lyricsHash],
    });
  }, [provider, sourceLanguage, translationTarget, queryClient, mode, curated, trackId, lyricsHash]);

  if (!enabled) return { state: { status: 'off' }, prepare: null, curated };
  if (!provider && !curated) return { state: { status: 'unsupported' }, prepare: null, curated };
  if (!lyrics || !trackId) return { state: { status: 'off' }, prepare: null, curated };
  if (query.isPending) return { state: { status: 'loading' }, prepare: null, curated };
  if (query.isError || !data) {
    return { state: { status: 'unavailable', message: 'Translation failed.' }, prepare: null, curated };
  }
  return { state: data, prepare: data.status === 'needs-download' && provider?.prepare ? prepare : null, curated };
}
