import { SPEECH_LEVELS, type SpeechLevel, type TermMapping, type TranslationBrief } from '../../translation/curated/types';
import type { CuratedLyricLine, CuratedLyrics } from './types';

export class CuratedLyricsError extends Error {
  constructor(message: string) { super(message); this.name = 'CuratedLyricsError'; }
}

type Json = Record<string, unknown>;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const object = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

export function parseCuratedLyrics(key: string, file: string, raw: unknown): CuratedLyrics {
  const fail = (message: string): never => { throw new CuratedLyricsError(`${file}: ${message}`); };
  if (!object(raw)) fail('the file must contain one JSON object.');
  const root = raw as Json;
  const text = (obj: Json, field: string, label = field) => {
    const value = obj[field];
    if (typeof value !== 'string' || !value.trim()) fail(`"${label}" must be non-empty text.`);
    return (value as string).trim();
  };
  const optionalText = (obj: Json, field: string, label = field) => obj[field] === undefined ? undefined : text(obj, field, label);
  const list = (obj: Json, field: string, required: boolean, label = field): string[] | undefined => {
    const value = obj[field];
    if (value === undefined && !required) return undefined;
    if (!Array.isArray(value) || (required && !value.length) || value.some((item) => typeof item !== 'string' || !item.trim()))
      fail(`"${label}" must be a list of non-empty text${required ? ' with at least one entry' : ''}.`);
    return (value as string[]).map((item) => item.trim());
  };
  const terms = (obj: Json, field: string): TermMapping[] | undefined => {
    if (obj[field] === undefined) return undefined;
    if (!Array.isArray(obj[field])) fail(`"brief.${field}" must be a list.`);
    return (obj[field] as unknown[]).map((value, index) => {
      if (!object(value)) fail(`"brief.${field}[${index}]" must be an object.`);
      const item = value as Json;
      return { source: text(item, 'source'), target: text(item, 'target'), note: optionalText(item, 'note') };
    });
  };
  if (!object(root.brief)) fail('"brief" is required.');
  const briefRaw = root.brief as Json;
  if (!SPEECH_LEVELS.includes(briefRaw.register as SpeechLevel)) fail('"brief.register" is invalid.');
  const brief: TranslationBrief = {
    speaker: text(briefRaw, 'speaker', 'brief.speaker'), addressee: text(briefRaw, 'addressee', 'brief.addressee'),
    relationship: optionalText(briefRaw, 'relationship'), situation: optionalText(briefRaw, 'situation'),
    register: briefRaw.register as SpeechLevel, pronouns: terms(briefRaw, 'pronouns'), glossary: terms(briefRaw, 'glossary'),
    reasoning: text(briefRaw, 'reasoning', 'brief.reasoning'), sources: list(briefRaw, 'sources', false),
  };
  if (!Array.isArray(root.lines) || !root.lines.length) fail('"lines" must be a non-empty list.');
  let previous = -1;
  const lines = (root.lines as unknown[]).map((value, index): CuratedLyricLine => {
    if (!object(value)) fail(`"lines[${index}]" must be an object.`);
    const item = value as Json;
    if (!Number.isFinite(item.startMs) || (item.startMs as number) < 0 || (item.startMs as number) <= previous)
      fail(`"lines[${index}].startMs" must be a non-negative number, strictly after the previous line.`);
    previous = item.startMs as number;
    const endMs = item.endMs;
    if (endMs !== undefined && (!Number.isFinite(endMs) || (endMs as number) <= previous)) fail(`"lines[${index}].endMs" is invalid.`);
    return { startMs: previous, endMs: endMs as number | undefined, text: text(item, 'text'), translation: text(item, 'translation') };
  });
  const date = (field: string, required: boolean) => {
    const value = root[field];
    if (value === undefined && !required) return undefined;
    if (typeof value !== 'string' || !DATE.test(value)) fail(`"${field}" must be a YYYY-MM-DD date.`);
    return value as string;
  };
  let lyricsSource: CuratedLyrics['lyricsSource'];
  if (root.lyricsSource !== undefined) {
    if (!object(root.lyricsSource)) fail('"lyricsSource" must be an object.');
    const source = root.lyricsSource as Json;
    if (source.id !== undefined && typeof source.id !== 'string' && typeof source.id !== 'number') fail('"lyricsSource.id" must be text or a number.');
    if (source.durationMs !== undefined && (typeof source.durationMs !== 'number' || !Number.isFinite(source.durationMs))) fail('"lyricsSource.durationMs" must be a number.');
    lyricsSource = { provider: text(source, 'provider'), id: source.id as string | number | undefined, durationMs: source.durationMs as number | undefined, url: optionalText(source, 'url', 'lyricsSource.url') };
  }
  return { key, trackIds: list(root, 'trackIds', false) ?? [], titles: list(root, 'titles', true)!, artistNames: list(root, 'artistNames', true)!, sourceLanguage: text(root, 'sourceLanguage'), targetLanguage: text(root, 'targetLanguage'), brief, lines, lyricsSource, written: date('written', true)!, updated: date('updated', false) };
}
