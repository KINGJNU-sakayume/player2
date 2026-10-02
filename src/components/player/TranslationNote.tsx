import type { TrackIdentity } from '../../domain/types';
import type { TimedLyricLine } from '../../lyrics/types';
import type { CuratedCoverage } from '../../translation/translateLyrics';
import { SPEECH_LEVEL_LABEL, type TermMapping } from '../../translation/curated/types';
import type { NotePayload } from '../NoteContext';

const LANGUAGE_LABEL: Record<string, string> = { ja: 'Japanese', en: 'English', ko: 'Korean', zh: 'Chinese' };

function languageLabel(tag: string): string {
  return LANGUAGE_LABEL[tag.split('-')[0]!.toLowerCase()] ?? tag;
}

function termList(terms: TermMapping[] | undefined): string[] {
  return (terms ?? []).map((term) => `- ${term.source} → **${term.target}**${term.note ? ` — ${term.note}` : ''}`);
}

/** The brief as a note: who speaks to whom, the speech level and why, pronouns and recurring terms. */
export function briefMarkdown(coverage: CuratedCoverage): string {
  const { brief } = coverage.translation;
  const who = [
    `- **화자** — ${brief.speaker}`,
    `- **청자** — ${brief.addressee}`,
    brief.relationship && `- **관계** — ${brief.relationship}`,
    brief.situation && `- **상황** — ${brief.situation}`,
  ].filter(Boolean);
  const sections = [`## 화자와 청자\n${who.join('\n')}`, `## 어체 · ${SPEECH_LEVEL_LABEL[brief.register]}\n${brief.reasoning}`];
  const pronouns = termList(brief.pronouns);
  if (pronouns.length) sections.push(`## 인칭과 호칭\n${pronouns.join('\n')}`);
  const glossary = termList(brief.glossary);
  if (glossary.length) sections.push(`## 반복되는 말\n${glossary.join('\n')}`);
  return sections.join('\n\n');
}

function LinePairs({
  lines,
  translations,
  lineLanguages,
  coverage,
}: {
  lines: TimedLyricLine[];
  translations: string[];
  lineLanguages: (string | undefined)[];
  coverage: CuratedCoverage;
}) {
  const machine = new Set(coverage.machine);
  return (
    <div className="note-body translation-pairs">
      <h3>
        대역
        <span className="translation-coverage">
          {coverage.matched} / {coverage.total} lines curated
          {coverage.machine.length > 0 ? ` · ${coverage.machine.length} machine` : ''}
        </span>
      </h3>
      <ol className="lyric-pairs">
        {lines.map((line, index) =>
          line.text.trim() ? (
            <li key={index}>
              <span className="lyric-original" lang={lineLanguages[index]}>
                {line.text}
              </span>
              {translations[index] && (
                <span className="lyric-translation">
                  {translations[index]}
                  {machine.has(index) && <span className="lyric-machine"> · machine</span>}
                </span>
              )}
            </li>
          ) : null,
        )}
      </ol>
    </div>
  );
}

/**
 * The drawer payload for a curated translation. The original lines come from
 * the lyrics loaded at runtime; the repository holds only the translation.
 */
export function translationNotePayload({
  track,
  lines,
  translations,
  lineLanguages,
  coverage,
  titleLang,
}: {
  track: TrackIdentity;
  lines: TimedLyricLine[];
  translations: string[];
  lineLanguages: (string | undefined)[];
  coverage: CuratedCoverage;
  titleLang?: string;
}): NotePayload {
  const { translation } = coverage;
  return {
    context: 'Translation note / Song',
    title: track.title,
    titleLang,
    subtitle: [
      track.artists.map((artist) => artist.name).join(', '),
      `${languageLabel(translation.sourceLanguage)} → ${languageLabel(translation.targetLanguage)}`,
      SPEECH_LEVEL_LABEL[translation.brief.register],
    ].join(' · '),
    copy: briefMarkdown(coverage),
    extra: <LinePairs lines={lines} translations={translations} lineLanguages={lineLanguages} coverage={coverage} />,
    written: translation.written,
    updated: translation.updated,
    sources: translation.brief.sources,
  };
}
