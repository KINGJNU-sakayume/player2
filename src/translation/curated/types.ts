/**
 * Curated lyric translations: written per song after the song's context has
 * been worked out — who is speaking, to whom, in what relationship — so the
 * Korean speech level stays deliberate and consistent across the whole song
 * instead of drifting line by line as machine translation does.
 *
 * The files (`src/translations/<artist>/<song>.json`) never contain the
 * original lyrics: each translated line is keyed by a hash of the original
 * line (see lineHash.ts) and matched against the lyrics loaded at runtime.
 */

/**
 * Korean speech levels used in lyrics.
 * - hapsyoche: 하십시오체 (formal polite: -습니다)
 * - haeyoche:  해요체 (polite: -아요/-어요)
 * - haeche:    해체 (intimate 반말: -아/-어, -지)
 * - haerache:  해라체 (plain 반말, monologue / written: -는다, -다)
 */
export type SpeechLevel = 'hapsyoche' | 'haeyoche' | 'haeche' | 'haerache';

export const SPEECH_LEVELS: readonly SpeechLevel[] = ['hapsyoche', 'haeyoche', 'haeche', 'haerache'];

export const SPEECH_LEVEL_LABEL: Record<SpeechLevel, string> = {
  hapsyoche: '존댓말 · 하십시오체',
  haeyoche: '존댓말 · 해요체',
  haeche: '반말 · 해체',
  haerache: '반말 · 해라체',
};

export interface TermMapping {
  source: string;
  target: string;
  note?: string;
}

/** The context worked out before translating; it decides every line's voice. */
export interface TranslationBrief {
  /** Who sings the lines, as the song presents them. */
  speaker: string;
  /** Who the lines are addressed to ("너", "떠난 사람", "자기 자신", "청중"). */
  addressee: string;
  relationship?: string;
  /** Time, place and situation of the song. */
  situation?: string;
  /** The speech level the translation keeps throughout. */
  register: SpeechLevel;
  /** How pronouns and forms of address are carried over (君 → 너, あなた → 당신 …). */
  pronouns?: TermMapping[];
  /** Recurring words, names and images and how they are rendered. */
  glossary?: TermMapping[];
  /** Why this voice: evidence from the lyrics, interviews, the tie-in, the album. Markdown subset. */
  reasoning: string;
  /** References for the context: interviews, liner notes, articles. */
  sources?: string[];
}

export interface CuratedTranslation {
  /** File name without extension, e.g. "lemon". */
  key: string;
  /** Spotify track IDs (album cut, single, editions). */
  trackIds: string[];
  /** Titles as Spotify may show them; with `artistNames`, the fallback match. */
  titles: string[];
  artistNames: string[];
  /** Language of the original lyrics (BCP 47). */
  sourceLanguage: string;
  /** Language of the translation (BCP 47), usually "ko". */
  targetLanguage: string;
  /** The lyrics version the hashes were taken from, for re-checking later. */
  lyricsSource?: { provider: string; id?: number | string; durationMs?: number };
  brief: TranslationBrief;
  /**
   * Translated lines keyed by the original line's hash. A repeated line uses
   * one entry; `<hash>#<n>` overrides the n-th occurrence (1-based) when a
   * repeat needs a different rendering.
   */
  lines: Record<string, string>;
  /** ISO dates (YYYY-MM-DD). */
  written: string;
  updated?: string;
}
