/**
 * Writing tool for curated lyric translations (see .claude/skills/translate-lyrics).
 *
 *   npm run lyrics:lines -- --title "Lemon" --artist "Kenshi Yonezu" [--album "Lemon"] [--duration 4:15]
 *   npm run lyrics:lines -- --id 123456
 *       Prints the LRCLIB record and one row per lyric line: number, line hash, original text.
 *       The hashes are the keys of the translation file's "lines" object.
 *
 *   npm run lyrics:lines -- --file /path/outside/the/repo/lemon.lrc
 *       The same table from a local LRC or plain-text file (one lyric line per line), for when
 *       lrclib.net is unreachable. Keep that file outside the repository (e.g. a scratch directory).
 *
 *   npm run lyrics:lines -- --check src/translations/kenshi-yonezu/lemon.json
 *       Re-fetches the lyrics the file was written against (lyricsSource.id) and reports
 *       untranslated lines and keys that match nothing.
 *
 * The original lyrics are only printed to the terminal — never write them to a file in this repository.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseLrc } from '../src/lyrics/lrc';
import { LRCLIB_BASE_URL, recordToTimedLyrics, type LrclibRecord } from '../src/lyrics/providers/LrclibLyricsProvider';
import type { TimedLyrics } from '../src/lyrics/types';
import { checkTranslation, formatLineTable } from '../src/translation/curated/authoring';
import { parseCuratedTranslation } from '../src/translation/curated/parse';

const CLIENT = 'ARC Music translation tool (https://github.com/KINGJNU-sakayume/player2)';

function args(): Map<string, string> {
  const map = new Map<string, string>();
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]!;
    if (!flag.startsWith('--')) continue;
    const value = argv[i + 1] && !argv[i + 1]!.startsWith('--') ? argv[(i += 1)]! : 'true';
    map.set(flag.slice(2), value);
  }
  return map;
}

function seconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parts = value.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  return parts.length === 2 ? parts[0]! * 60 + parts[1]! : parts[0];
}

async function lrclib<T>(path: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${LRCLIB_BASE_URL}${path}`, { headers: { 'Lrclib-Client': CLIENT } });
  } catch (error) {
    throw new Error(
      `lrclib.net is unreachable (${error instanceof Error ? (error.cause as Error | undefined)?.message ?? error.message : error}). ` +
        'Behind a proxy, run with NODE_USE_ENV_PROXY=1; in a sandbox, lrclib.net must be an allowed host.',
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`LRCLIB responded ${response.status}.`);
  return (await response.json()) as T;
}

async function findRecord(options: Map<string, string>): Promise<LrclibRecord> {
  const id = options.get('id');
  if (id) {
    const record = await lrclib<LrclibRecord>(`/get/${encodeURIComponent(id)}`);
    if (!record) throw new Error(`No LRCLIB record ${id}.`);
    return record;
  }
  const title = options.get('title');
  const artist = options.get('artist');
  if (!title || !artist) throw new Error('Pass --title and --artist (optionally --album, --duration m:ss), or --id.');
  const duration = seconds(options.get('duration'));

  const query = new URLSearchParams({ track_name: title, artist_name: artist });
  if (options.get('album')) query.set('album_name', options.get('album')!);
  if (duration) query.set('duration', String(duration));
  const exact = options.get('album') && duration ? await lrclib<LrclibRecord>(`/get?${query.toString()}`) : null;
  if (exact?.syncedLyrics) return exact;

  const results = (await lrclib<LrclibRecord[]>(`/search?${new URLSearchParams({ track_name: title, artist_name: artist })}`)) ?? [];
  const synced = results.filter((record) => record.syncedLyrics);
  if (synced.length === 0) throw new Error('LRCLIB has no synced lyrics for this search.');
  console.error('Candidates (pick one with --id if the first is not the right version):');
  for (const record of synced.slice(0, 8)) {
    console.error(`  --id ${record.id}  ${record.trackName} — ${record.artistName} / ${record.albumName ?? '?'} (${record.duration ?? '?'} s)`);
  }
  const best = duration ? synced.find((record) => Math.abs((record.duration ?? 0) - duration) <= 3) : undefined;
  return best ?? synced[0]!;
}

function readLocalLyrics(path: string): TimedLyrics {
  const text = readFileSync(path, 'utf8');
  const timed = parseLrc(text);
  if (timed.length > 0) return { lines: timed };
  return { lines: text.split(/\r?\n/).map((line, i) => ({ startMs: i, text: line })) };
}

async function main(): Promise<void> {
  const options = args();
  const localPath = options.get('file');
  if (localPath) {
    if (!options.get('check')) {
      console.log(`Local file ${basename(localPath)} (no lyricsSource: add one only if these are LRCLIB's lines)`);
      console.log('');
      console.log(formatLineTable(readLocalLyrics(localPath)));
      return;
    }
  }
  const checkPath = options.get('check');
  if (checkPath) {
    const curated = parseCuratedTranslation(basename(checkPath, '.json'), checkPath, JSON.parse(readFileSync(checkPath, 'utf8')));
    const lrclibId = curated.lyricsSource?.provider === 'lrclib' ? curated.lyricsSource.id : undefined;
    let lyrics: TimedLyrics | null;
    if (localPath) {
      lyrics = readLocalLyrics(localPath);
    } else if (lrclibId !== undefined) {
      options.set('id', String(lrclibId));
      lyrics = recordToTimedLyrics(await findRecord(options));
    } else {
      throw new Error('The file has no lyricsSource { "provider": "lrclib", "id": … } to check against; pass --file as well.');
    }
    if (!lyrics || lyrics.lines.length === 0) throw new Error('No synced lyrics to check against.');
    const report = checkTranslation(lyrics, curated);
    console.log(`${checkPath}: ${report.matched} / ${report.total} lines translated`);
    for (const row of report.untranslated) console.log(`  untranslated ${String(row.number).padStart(3)}  ${row.hash}${row.occurrence > 1 ? `#${row.occurrence}` : ''}  ${row.text}`);
    for (const key of report.unusedKeys) console.log(`  unused key   ${key}`);
    if (report.untranslated.length || report.unusedKeys.length) process.exitCode = 1;
    return;
  }

  const record = await findRecord(options);
  const lyrics = recordToTimedLyrics(record);
  if (!lyrics || lyrics.lines.length === 0) throw new Error(`LRCLIB record ${record.id} has no synced lyrics.`);
  console.log(`LRCLIB ${record.id}: ${record.trackName} — ${record.artistName} / ${record.albumName ?? '?'} (${record.duration ?? '?'} s, ${lyrics.language ?? '?'})`);
  console.log(`lyricsSource: { "provider": "lrclib", "id": ${record.id}, "durationMs": ${Math.round((record.duration ?? 0) * 1000)} }`);
  console.log('');
  console.log(formatLineTable(lyrics));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
