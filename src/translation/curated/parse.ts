import { LINE_KEY } from './lineHash';
import { SPEECH_LEVELS, type CuratedTranslation, type SpeechLevel, type TermMapping, type TranslationBrief } from './types';

/**
 * Validates one translation file. Throws with the file path and the field so
 * `npm run test:run` points at the mistake; the app never sees a malformed file.
 */

export class CuratedTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CuratedTranslationError';
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCuratedTranslation(key: string, file: string, raw: unknown): CuratedTranslation {
  const fail = (message: string): never => {
    throw new CuratedTranslationError(`${file}: ${message}`);
  };
  const text = (obj: Json, field: string, label = field): string => {
    const value = obj[field];
    if (typeof value !== 'string' || !value.trim()) fail(`"${label}" must be non-empty text.`);
    return (value as string).trim();
  };
  const optionalText = (obj: Json, field: string, label = field): string | undefined =>
    obj[field] === undefined ? undefined : text(obj, field, label);
  const textList = (obj: Json, field: string, required: boolean, label = field): string[] | undefined => {
    const value = obj[field];
    if (value === undefined && !required) return undefined;
    if (!Array.isArray(value) || (required && value.length === 0) || value.some((item) => typeof item !== 'string' || !item.trim())) {
      fail(`"${label}" must be a list of non-empty text${required ? ' with at least one entry' : ''}.`);
    }
    return (value as string[]).map((item) => item.trim());
  };
  const terms = (obj: Json, field: string): TermMapping[] | undefined => {
    const value = obj[field];
    if (value === undefined) return undefined;
    if (!Array.isArray(value)) fail(`"brief.${field}" must be a list.`);
    return (value as unknown[]).map((entry, i) => {
      if (!isObject(entry)) fail(`"brief.${field}[${i}]" must be an object.`);
      const item = entry as Json;
      return {
        source: text(item, 'source', `brief.${field}[${i}].source`),
        target: text(item, 'target', `brief.${field}[${i}].target`),
        note: optionalText(item, 'note', `brief.${field}[${i}].note`),
      };
    });
  };
  const date = (obj: Json, field: string, required: boolean): string | undefined => {
    const value = obj[field];
    if (value === undefined && !required) return undefined;
    if (typeof value !== 'string' || !ISO_DATE.test(value)) fail(`"${field}" must be a YYYY-MM-DD date.`);
    return value as string;
  };

  if (!isObject(raw)) fail('the file must contain one JSON object.');
  const root = raw as Json;

  if (!isObject(root.brief)) fail('"brief" is required.');
  const briefRaw = root.brief as Json;
  const register = briefRaw.register;
  if (!SPEECH_LEVELS.includes(register as SpeechLevel)) fail(`"brief.register" must be one of ${SPEECH_LEVELS.join(', ')}.`);
  const brief: TranslationBrief = {
    speaker: text(briefRaw, 'speaker', 'brief.speaker'),
    addressee: text(briefRaw, 'addressee', 'brief.addressee'),
    relationship: optionalText(briefRaw, 'relationship', 'brief.relationship'),
    situation: optionalText(briefRaw, 'situation', 'brief.situation'),
    register: register as SpeechLevel,
    pronouns: terms(briefRaw, 'pronouns'),
    glossary: terms(briefRaw, 'glossary'),
    reasoning: text(briefRaw, 'reasoning', 'brief.reasoning'),
    sources: textList(briefRaw, 'sources', false, 'brief.sources'),
  };

  if (!isObject(root.lines)) fail('"lines" must be an object of { "<line hash>": "translation" }.');
  const lines: Record<string, string> = {};
  for (const [lineKey, value] of Object.entries(root.lines as Json)) {
    if (!LINE_KEY.test(lineKey)) fail(`line key "${lineKey}" is not an 8-character hash (optionally "#n").`);
    if (typeof value !== 'string' || !value.trim()) fail(`line "${lineKey}" needs a non-empty translation.`);
    lines[lineKey] = (value as string).trim();
  }
  if (Object.keys(lines).length === 0) fail('"lines" is empty.');

  let lyricsSource: CuratedTranslation['lyricsSource'];
  if (root.lyricsSource !== undefined) {
    if (!isObject(root.lyricsSource)) fail('"lyricsSource" must be an object.');
    const source = root.lyricsSource as Json;
    const id = source.id;
    const durationMs = source.durationMs;
    if (id !== undefined && typeof id !== 'string' && typeof id !== 'number') fail('"lyricsSource.id" must be text or a number.');
    if (durationMs !== undefined && typeof durationMs !== 'number') fail('"lyricsSource.durationMs" must be a number.');
    lyricsSource = {
      provider: text(source, 'provider', 'lyricsSource.provider'),
      id: id as string | number | undefined,
      durationMs: durationMs as number | undefined,
    };
  }

  return {
    key,
    trackIds: textList(root, 'trackIds', false) ?? [],
    titles: textList(root, 'titles', true)!,
    artistNames: textList(root, 'artistNames', true)!,
    sourceLanguage: text(root, 'sourceLanguage'),
    targetLanguage: text(root, 'targetLanguage'),
    lyricsSource,
    brief,
    lines,
    written: date(root, 'written', true)!,
    updated: date(root, 'updated', false),
  };
}
