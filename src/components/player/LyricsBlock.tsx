import { useMemo } from 'react';
import { useSession } from '../../app/sessionContext';
import type { TrackIdentity } from '../../domain/types';
import type { TimedLyricLine } from '../../lyrics/types';
import type { LyricsState } from '../../lyrics/useTimedLyrics';
import { useLyricCursor } from '../../playback/hooks';
import { usePreferences } from '../../preferences/preferences';
import { SPEECH_LEVEL_LABEL } from '../../translation/curated/types';
import { detectLineLanguage, detectLineLanguages } from '../../translation/languageDetect';
import { useLyricTranslation, type TranslationState } from '../../translation/useLyricTranslation';
import { useNote } from '../NoteContext';
import { translationNotePayload } from './TranslationNote';

/** v7 shows the current line, its translation and the next two lines. */
const UPCOMING_LINES = 2;

export const LANGUAGE_NAMES: Record<string, string> = { ko: 'Korean', ja: 'Japanese', en: 'English', zh: 'Chinese' };

export function languageName(tag: string | undefined): string | null {
  if (!tag) return null;
  return LANGUAGE_NAMES[tag.split('-')[0]!.toLowerCase()] ?? tag;
}

function TranslationStatus({
  state,
  target,
  prepare,
  openNote,
}: {
  state: TranslationState;
  target: string;
  prepare: (() => Promise<void>) | null;
  openNote: (() => void) | null;
}) {
  switch (state.status) {
    case 'loading':
      return <span>Translating…</span>;
    case 'ready':
      if (state.curated) {
        const { total, matched, machine } = state.curated;
        return (
          <>
            <span
              className="curated-mark"
              title={`${matched} of ${total} lines from the curated translation${machine.length ? `, ${machine.length} machine-translated` : ''}`}
            >
              Curated · <span lang="ko">{SPEECH_LEVEL_LABEL[state.curated.translation.brief.register]}</span>
            </span>
            {openNote && (
              <button type="button" className="note-more" aria-haspopup="dialog" onClick={openNote}>
                Translation note →
              </button>
            )}
          </>
        );
      }
      return <span>{languageName(target)}</span>;
    case 'not-needed':
      return <span>Already in {languageName(target)}</span>;
    case 'needs-download':
      return prepare ? (
        <button type="button" className="note-more" onClick={() => void prepare()}>
          Download {languageName(target)} translation
        </button>
      ) : null;
    case 'unavailable':
    case 'unsupported':
      return <span title={state.status === 'unavailable' ? state.message : undefined}>Translation unavailable</span>;
    default:
      return null;
  }
}

/**
 * The right-hand listening column's lyric area. The active line comes from
 * the central playback clock, so pause, seek and device changes stay in sync.
 * Translation is secondary: when it fails only its row disappears.
 */
export function LyricsBlock({ track, lyricsState, context }: { track: TrackIdentity; lyricsState: LyricsState; context: string }) {
  const { translation: provider, translationTarget } = useSession();
  const [preferences, setPreferences] = usePreferences();
  const lyrics = lyricsState.status === 'ready' ? lyricsState.lyrics : null;
  const lines: TimedLyricLine[] | null = lyrics?.lines ?? null;
  const { state: translation, prepare, curated } = useLyricTranslation(track, lyrics, preferences.translationEnabled);
  const { openNote } = useNote();
  const { activeIndex, nextIndex } = useLyricCursor(lines);

  const lineLanguages = useMemo(
    () => (lines ? detectLineLanguages(lines.map((l) => l.text), lyrics?.language) : []),
    [lines, lyrics?.language],
  );

  const source = lyricsState.status === 'ready' ? lyrics?.source : lyricsState.status === 'instrumental' ? lyricsState.source : null;
  const current = lines && activeIndex >= 0 ? lines[activeIndex]! : null;
  const upcoming = lines ? lines.slice(nextIndex, nextIndex + UPCOMING_LINES) : [];
  const translated = translation.status === 'ready' && activeIndex >= 0 ? (translation.lines[activeIndex] ?? '').trim() : '';
  const openTranslationNote =
    translation.status === 'ready' && translation.curated && lines
      ? () =>
          openNote(
            translationNotePayload({
              track,
              lines,
              translations: translation.lines,
              lineLanguages,
              coverage: translation.curated!,
              titleLang: detectLineLanguage(track.title),
            }),
          )
      : null;

  return (
    <>
      <div className="listening-head">
        <h2 id="lyrics-label">Lyrics</h2>
        <div className="listening-context">
          <span>{[context, source].filter(Boolean).join(' · ')}</span>
          {(provider || curated) && (
            <span className="translation-tools">
              {preferences.translationEnabled && lines && (
                <TranslationStatus state={translation} target={translationTarget} prepare={prepare} openNote={openTranslationNote} />
              )}
              <button
                type="button"
                className="text-toggle"
                aria-pressed={preferences.translationEnabled}
                onClick={() => setPreferences({ translationEnabled: !preferences.translationEnabled })}
              >
                Translation <b>{preferences.translationEnabled ? 'On' : 'Off'}</b>
              </button>
            </span>
          )}
        </div>
      </div>

      <section className="lyrics-panel" aria-labelledby="lyrics-label">
        {lyricsState.status === 'loading' && <div className="current-lyric is-state">Finding synchronized lyrics…</div>}
        {lyricsState.status === 'idle' && <div className="current-lyric is-state">Lyrics</div>}
        {lyricsState.status === 'disabled' && (
          <>
            <div className="current-lyric is-state">Lyrics are turned off</div>
            <div className="current-trans">No lyrics provider is configured. Playback is unaffected.</div>
          </>
        )}
        {lyricsState.status === 'unavailable' && (
          <div role="status">
            <div className="current-lyric is-state">
              {lyricsState.reason === 'error' ? 'Lyrics provider unavailable' : 'Synchronized lyrics unavailable'}
            </div>
            <div className="current-trans">
              {lyricsState.reason === 'error'
                ? 'The lyrics provider did not respond. Playback continues normally.'
                : 'No timed lyrics were found for this recording. Playback continues normally.'}
            </div>
            {lyricsState.reason === 'error' && (
              <button type="button" className="note-more" onClick={lyricsState.retry}>
                Try again
              </button>
            )}
          </div>
        )}
        {lyricsState.status === 'instrumental' && (
          <div role="status">
            <div className="current-lyric is-state">Instrumental</div>
            <div className="current-trans">This track has no lyrics.</div>
          </div>
        )}

        {lines && (
          <>
            {current ? (
              <p key={`line-${activeIndex}`} className="current-lyric" lang={lineLanguages[activeIndex]}>
                {current.text}
              </p>
            ) : (
              <p key={`gap-${nextIndex}`} className="current-lyric is-gap" aria-hidden="true">
                ···
              </p>
            )}
            {translated && (
              <p key={`tr-${activeIndex}`} className="current-trans" lang={translationTarget}>
                {translated}
              </p>
            )}
            <ol className="next-lines" aria-label="Next lines">
              {upcoming.map((line, offset) => (
                <li
                  key={`next-${nextIndex + offset}`}
                  className={offset === 0 ? 'next-line' : 'next-line second'}
                  lang={lineLanguages[nextIndex + offset]}
                >
                  {line.text}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </>
  );
}
