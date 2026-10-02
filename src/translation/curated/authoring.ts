import type { TimedLyrics } from '../../lyrics/types';
import { applyCuratedTranslation } from './index';
import { lyricLineHash } from './lineHash';
import type { CuratedTranslation } from './types';

/**
 * Helpers for writing a curated translation (used by scripts/lyrics-lines.ts).
 * They print the original lines only to the terminal; nothing here writes
 * lyrics to a file.
 */

export interface LineKeyRow {
  /** 1-based line number among lines with text. */
  number: number;
  /** The key to use in the translation file: `<hash>` or, for a repeat, `<hash>#<n>` if it needs its own rendering. */
  hash: string;
  occurrence: number;
  text: string;
}

export function lineKeyRows(lyrics: TimedLyrics): LineKeyRow[] {
  const seen = new Map<string, number>();
  const rows: LineKeyRow[] = [];
  for (const line of lyrics.lines) {
    const hash = lyricLineHash(line.text);
    if (!hash) continue;
    const occurrence = (seen.get(hash) ?? 0) + 1;
    seen.set(hash, occurrence);
    rows.push({ number: rows.length + 1, hash, occurrence, text: line.text.trim() });
  }
  return rows;
}

/** `  1  a1b2c3d4      窓の外で…`; a repeat shows `#n`, the key that overrides only that occurrence. */
export function formatLineTable(lyrics: TimedLyrics): string {
  return lineKeyRows(lyrics)
    .map((row) => {
      const repeat = row.occurrence > 1 ? `#${row.occurrence}`.padEnd(4) : '    ';
      return `${String(row.number).padStart(3)}  ${row.hash}${repeat}  ${row.text}`;
    })
    .join('\n');
}

export interface TranslationCheck {
  total: number;
  matched: number;
  /** Lines with text the file does not translate (1-based numbers, as in the table). */
  untranslated: LineKeyRow[];
  /** Keys in the file that match no line of these lyrics (typos or another lyrics version). */
  unusedKeys: string[];
}

export function checkTranslation(lyrics: TimedLyrics, curated: CuratedTranslation): TranslationCheck {
  const rows = lineKeyRows(lyrics);
  const applied = applyCuratedTranslation(lyrics, curated);
  const used = new Set<string>();
  for (const row of rows) {
    const occurrenceKey = `${row.hash}#${row.occurrence}`;
    if (occurrenceKey in curated.lines) used.add(occurrenceKey);
    else if (row.hash in curated.lines) used.add(row.hash);
  }
  const untranslated = rows.filter((row) => !(`${row.hash}#${row.occurrence}` in curated.lines) && !(row.hash in curated.lines));
  return {
    total: applied.total,
    matched: applied.matched,
    untranslated,
    unusedKeys: Object.keys(curated.lines).filter((key) => !used.has(key)),
  };
}
